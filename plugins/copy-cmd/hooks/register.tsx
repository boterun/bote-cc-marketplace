import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// The shell commands found in Claude's last main-loop reply, in order.
const commands = atom({ plugin: 'copy-cmd', key: 'commands' } as const, [], {
  shape: 'commands-1',
})

const SHELL_LANGS = new Set([
  'bash',
  'sh',
  'shell',
  'zsh',
  'fish',
  'console',
  'terminal',
  'powershell',
  'pwsh',
  'ps1',
  'cmd',
  'bat',
])

// Digits 1-9 are the band's hotkeys, so at most nine buttons.
const MAX_BUTTONS = 9

const FENCE = /^(`{3,}|~{3,})[ \t]*([^\s`]*)[^\n]*\n([\s\S]*?)\n[ \t]*\1[ \t]*$/gm

// An untagged block counts only when it does not look like a tree, JSON or markup.
function looksLikeCommand(body: string): boolean {
  const first = body.trimStart()

  return !/^[{[<]/.test(first) && !/[├└│]/.test(body)
}

// `$ ` prompts (as in a `console` block) are not part of the command.
function stripPrompts(body: string): string {
  return body
    .split('\n')
    .map(line => line.replace(/^\s*\$ /, ''))
    .join('\n')
    .trim()
}

export function extractCommands(markdown: string): string[] {
  const found: string[] = []

  for (const match of markdown.matchAll(FENCE)) {
    const lang = (match[2] ?? '').toLowerCase()
    const body = match[3] ?? ''
    const isShell = SHELL_LANGS.has(lang) || (lang === '' && looksLikeCommand(body))
    const text = isShell ? stripPrompts(body) : ''

    if (text !== '') {
      found.push(text)
    }
  }

  return found
}

function preview(command: string, width: number): string {
  const lines = command.split('\n')
  const more = lines.length > 1 ? ` (+${lines.length - 1} lines)` : ''
  const room = Math.max(10, width - more.length)
  const head = lines[0] ?? ''
  const cut = head.length > room ? `${head.slice(0, room - 1)}…` : head

  return `${cut}${more}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'copy-cmd',
      description: 'Copy a shell command from the last reply (number, default 1)',
      argumentHint: '[n]',
    })

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    // Subagents' turns end here too; only the main loop's reply is on screen.
    if (e.agentId === undefined && e.reason === 'answer') {
      const found = extractCommands(e.answer)
      await update($, commands, () => found)
    }

    return next(e)
  })

  on('command.run', { command: 'copy-cmd' }, async ($, e) => {
    const list = await read($, commands)
    const arg = e.args.trim()
    const n = arg === '' ? 1 : Number.parseInt(arg, 10)
    const command = list[n - 1]

    if (list.length === 0) {
      return { text: 'No shell commands in the last reply.' }
    }
    if (command === undefined) {
      return { text: `Pick a number from 1 to ${list.length}.` }
    }

    const result = await $.ui.copy({ text: command })

    return {
      text: result.isCopied
        ? `Copied: ${preview(command, 60)}`
        : `Copy failed (${result.reason})`,
    }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, commands)

    if (e.props.hasSurvey || list.length === 0) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    // "1: [copy] " is 10 cells.
    const width = e.props.bodyColumns - 11

    return (
      <Box flexDirection="column">
        <Text dimColor>Click [copy], or ctrl+x tab then 1-9</Text>
        {list.slice(0, MAX_BUTTONS).map((command, i) => (
          <Box key={`row:${i}`} flexDirection="row">
            <Button
              key={`copy:${i}`}
              hotkey={String(i + 1)}
              plain
              label="[copy]"
              hover={{ underline: true }}
              onPress={async press => {
                const result = await $.ui.copy({ text: command, surface: press.surface })
                $.ui.toast(
                  result.isCopied
                    ? `Copied: ${preview(command, 40)}`
                    : `Copy failed (${result.reason})`,
                )
              }}
            >
              <Text color="suggestion" bold>
                [copy]
              </Text>
            </Button>
            <Text> {preview(command, width)}</Text>
          </Box>
        ))}
      </Box>
    )
  })
}

import { expect, test } from 'claude-code/testing'

import { parseArgs } from '../hooks/register'

const BAND = {
  plugin: 'copy-cmd',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 20,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const ANSWER = [
  'Authenticate first.',
  '```',
  '! gh auth refresh -s workflow',
  '```',
  'Tree:',
  '```',
  '.claude-plugin/',
  '├── marketplace.json',
  '```',
  '```json',
  '{ "a": 1 }',
  '```',
  '```console',
  '$ git status',
  '$ git push',
  '```',
].join('\n')

const DONE = {
  answer: ANSWER,
  durationMs: 1,
  isAborted: false,
  turnId: 't1',
  reason: 'answer',
} as const

test('the band offers each shell command and copies it', async ($, on) => {
  const copied: string[] = []
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.copy', (_, e) => {
    copied.push(e.text)

    return { value: { isCopied: true } }
  })

  await $.turn.complete(DONE)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })

    expect(await ui.find({ key: 'copy:0' })).toBeDefined()
    expect(await ui.find({ key: 'copy:1' })).toBeDefined()
    // The tree and the JSON are not commands.
    expect(await ui.find({ key: 'copy:2' })).toBeUndefined()

    await ui.press({ key: 'copy:0' })
    await ui.press({ key: 'shell:0' })
    await ui.press({ key: 'shell:1' })
    await ui.unmount()
  }

  const once = [
    // [copy] drops the `!` the reply wrote; [!copy] puts one back.
    'gh auth refresh -s workflow',
    '! gh auth refresh -s workflow',
    // A multi-line command keeps every line after the one `!`.
    '! git status\ngit push',
  ]
  expect(copied).toEqual([...once, ...once])
})

test('a reply with no commands draws no row', async ($, on) => {
  on('turn.complete', () => ({ text: '' }))
  await $.turn.complete({ ...DONE, answer: 'No commands here.' })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await ui.find({ key: 'copy:0' })).toBeUndefined()
  await ui.unmount()
})

test("a subagent's answer leaves the band alone", async ($, on) => {
  on('turn.complete', () => ({ text: '' }))
  await $.turn.complete({ ...DONE, agentId: 'a1' })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await ui.find({ key: 'copy:0' })).toBeUndefined()
  await ui.unmount()
})

test('/copy-cmd reads a number and an optional !', () => {
  expect(parseArgs('')).toEqual({ n: 1, isShellMode: false })
  expect(parseArgs('2')).toEqual({ n: 2, isShellMode: false })
  expect(parseArgs('!2')).toEqual({ n: 2, isShellMode: true })
  expect(parseArgs(' ! 3 ')).toEqual({ n: 3, isShellMode: true })
  expect(parseArgs('!')).toEqual({ n: 1, isShellMode: true })
})

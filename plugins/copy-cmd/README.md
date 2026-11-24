# copy-cmd

A Claude Code mod that puts a `[copy]` button above the prompt for each shell
command in Claude's last reply, so you can copy a command with one click
instead of selecting it by hand.

```
Click [copy], or ctrl+x tab then 1-9
1: [copy] gh auth refresh -s workflow
2: [copy] git status (+1 lines)
```

## Install

```
/plugin marketplace add boterun/bote-cc-marketplace
/plugin install copy-cmd@bote-cc-marketplace
```

Restart Claude Code after installing.

## Usage

When a reply finishes, the row above the prompt lists its shell commands
(up to nine). Copy one in any of these ways:

| How | Works when |
| --- | --- |
| Click `[copy]` | Fullscreen renderer **and** mouse enabled (see Requirements) |
| `ctrl+x` `tab`, then `1`–`9` | Always |
| `/copy-cmd [n]` (default `1`) | Always |

A toast says `Copied: ...` or `Copy failed (<reason>)`.

### What counts as a shell command

- Fenced blocks tagged `bash`, `sh`, `shell`, `zsh`, `fish`, `console`,
  `terminal`, `powershell`, `pwsh`, `ps1`, `cmd` or `bat`.
- Untagged fenced blocks, unless they look like a file tree, JSON or markup.
- A leading `$ ` prompt is removed from each line. A leading `!` (Claude Code's
  shell prefix) is kept, so the command can be pasted straight into the prompt.
- Only the main conversation's last reply is used; subagents' answers are ignored.

## Requirements and known constraints

Clicking `[copy]` needs Claude Code to receive mouse events:

- **Fullscreen renderer.** Check with `/tui`. Under `/tui classic` no clicks
  reach the mod; use `ctrl+x tab` + digit or `/copy-cmd` instead.
- **Mouse not disabled.** `CLAUDE_CODE_DISABLE_MOUSE=1` turns mouse input off:
  clicks on `[copy]` do nothing, and the mouse wheel cycles prompt history
  instead of scrolling. Remove it from your shell profile (e.g. `~/.bashrc`).
- **VS Code keeps old environment variables.** After editing your shell
  profile, a new VS Code terminal can still carry the old value until VS Code
  itself restarts. Check with `echo $CLAUDE_CODE_DISABLE_MOUSE` before starting
  `claude`, or start it with `unset CLAUDE_CODE_DISABLE_MOUSE && claude`.
- **Run `claude` from a real shell.** Running `! claude --continue` inside
  Claude Code starts a nested, non-interactive process and does not restart
  the session.
- **Clipboard.** The terminal copies via a clipboard tool or OSC 52. Some
  terminals drop OSC 52 silently, in which case the toast can say `Copied`
  without anything reaching the clipboard.

### Tested environment

| | |
| --- | --- |
| Claude Code | 2.1.331 |
| OS | Windows + WSL2 (Linux 6.6) |
| Terminal | VS Code integrated terminal (`TERM_PROGRAM=vscode`) |
| Renderer | fullscreen (`CLAUDE_CODE_NO_FLICKER=1`), mouse enabled |

Other terminals and the desktop app are expected to work but are untested.

## Development

```
claude plugin validate plugins/copy-cmd
claude plugin test plugins/copy-cmd
```

## License

MIT

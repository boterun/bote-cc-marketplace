export type Commands = string[]

declare module 'claude-code' {
  interface PluginState {
    'copy-cmd': { commands: Shaped<Commands> }
  }
}

import { expect, test } from 'claude-code/testing'

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

    await ui.press({ key: 'copy:1' })
    await ui.unmount()
  }

  expect(copied).toEqual(['git status\ngit push', 'git status\ngit push'])
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

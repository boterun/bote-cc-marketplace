# bote-cc-marketplace

A personal Claude Code plugin marketplace.

## Use it

```
/plugin marketplace add boterun/bote-cc-marketplace
/plugin install <plugin-name>@bote-cc-marketplace
```

## Plugins

| Plugin | Description |
| --- | --- |
| [copy-cmd](./plugins/copy-cmd) | Buttons above the prompt that copy the shell commands from Claude's last reply |

## Adding a plugin

1. Create `plugins/<plugin-name>/` with `.claude-plugin/plugin.json` and whatever
   it needs (`commands/`, `skills/`, `agents/`, `hooks/`, a `README.md`).
2. Add an entry to `plugins` in `.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "<plugin-name>",
     "source": "./plugins/<plugin-name>",
     "description": "..."
   }
   ```

3. Validate with `claude plugin validate .` and `claude plugin validate plugins/<plugin-name>`.

Everything published here is written in English.

## Layout

```
.claude-plugin/
  marketplace.json   # marketplace definition
plugins/             # one folder per plugin
```

## License

MIT

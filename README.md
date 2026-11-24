# bote-cc-marketplace

個人用の Claude Code プラグインマーケットプレイス。

## 使い方

```
/plugin marketplace add boterun/bote-cc-marketplace
/plugin install <plugin-name>@bote-cc-marketplace
```

## プラグインの追加

1. `plugins/<plugin-name>/` を作り、`.claude-plugin/plugin.json` と `commands/` `skills/` `agents/` `hooks/` など必要なものを置く
2. `.claude-plugin/marketplace.json` の `plugins` に追記する

```json
{
  "name": "<plugin-name>",
  "source": "./plugins/<plugin-name>",
  "description": "..."
}
```

3. `claude plugin validate .` で検証する

## 構成

```
.claude-plugin/
  marketplace.json   # マーケットプレイスの定義
plugins/             # 各プラグインを置く場所
```

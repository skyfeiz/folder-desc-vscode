# folder-desc

<a href="https://marketplace.visualstudio.com/items?itemName=skyfeiz.folder-desc" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/skyfeiz.folder-desc.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://github.com/antfu/starter-vscode" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with antfu/starter-vscode" /></a>

Add description to the folder or file in VSCode.

## Features

- Add description to the folder or file in VSCode.
- config file is `.vscode/folder-desc.json`.
- find the nearest `package.json` directory or the root directory, then find the `.vscode/folder-desc.json` file in this directory, if the file does not exist, will create a new folder `.vscode` and a new file `folder-desc.json`.
- not support to add tooltip to the folder or file, but you can write the tooltip in the config file.

## config file demo

```json
// .vscode/folder-desc.json
{
  "aaa": {
    "description": "aaa"
  },
  "aaa/index.ts": {
    "description": "aaa-index.ts",
    "tooltip": "tooltip-index.ts"
  }
}
```

## Configurations

## Commands

<!-- commands -->

| Command               | Title           |
| --------------------- | --------------- |
| `folder-desc.addDesc` | Add Description |

<!-- commands -->

## License

[MIT](./LICENSE.md) License © 2026 [skyfeiz](https://github.com/skyfeiz)

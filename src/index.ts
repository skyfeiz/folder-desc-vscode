import type { Uri } from 'vscode';
import type { DescData } from './type';
import fg from 'fast-glob';
import { defineExtension, useEventEmitter } from 'reactive-vscode';
import { commands, FileDecoration, Uri as vscodeUri, window as vscodeWindow, workspace } from 'vscode';
import { getMatchedPath, readConfig, transformerConfig, writeConfig } from './utils';

// @ts-expect-error - support badge length greater than 2 characters
FileDecoration.validate = (): void => {};

let allDecs: DescData = {};
const changeEmitter = useEventEmitter<undefined | Uri | Uri[]>([]);

const { activate, deactivate } = defineExtension(async (context) => {
  // read all config
  allDecs = await readAllDecs();

  const decorationProvider = vscodeWindow.registerFileDecorationProvider({
    onDidChangeFileDecorations: changeEmitter.event,
    provideFileDecoration: (uri) => {
      const json = allDecs[uri.path];

      if (json) {
        return new FileDecoration(json.description, json.tooltip || '');
      }
    },
  });

  // init watcher
  const watcher = workspace.createFileSystemWatcher('**/.vscode/folder-desc.json');
  watcher.onDidChange(async (uri) => {
    const config = transformerConfig(uri.fsPath, readConfig(uri.fsPath));

    allDecs = { ...allDecs, ...config };

    for (const url in config) {
      const u = vscodeUri.file(url);
      changeEmitter.fire(u);
    }
  });

  // register command
  const disposable = commands.registerCommand('folder-desc.addDesc', actionAddDesc);

  context.subscriptions.push(watcher);
  context.subscriptions.push(decorationProvider);
  context.subscriptions.push(disposable);
});

async function actionAddDesc(uri: Uri) {
  const uriPath = uri.fsPath;
  const rootUris = workspace.workspaceFolders?.map(folder => folder.uri.path);

  const matchedPath = getMatchedPath(rootUris, uriPath);

  if (uriPath === matchedPath) {
    vscodeWindow.showInformationMessage('This is a root folder(not support to add description)');
    return;
  }

  const desc = await vscodeWindow.showInputBox({ prompt: 'Please enter the description', value: '' });

  // input has been canceled
  if (desc === undefined)
    return;

  writeConfig(matchedPath, uriPath, desc);

  if (allDecs[uriPath]) {
    allDecs[uriPath].description = desc || '';
  } else {
    allDecs[uriPath] = { description: desc || '' };
  }

  changeEmitter.fire(uri);
}

async function readAllDecs() {
  const rootUris = workspace.workspaceFolders?.map(folder => folder.uri.path);
  if (!rootUris)
    return {};

  const allConfigFiles: string[] = await Promise.all(rootUris.map(async (rootUri) => {
    return fg.async([`${rootUri}/**/.vscode/folder-desc.json`, '!**/node_modules/**'], { onlyFiles: true });
  })).then(files => files.flat());

  const allConfigs: DescData = allConfigFiles.reduce((acc, filePath) => {
    const config = transformerConfig(filePath, readConfig(filePath));
    return { ...acc, ...config };
  }, {} as DescData);

  return allConfigs;
}

export { activate, deactivate };

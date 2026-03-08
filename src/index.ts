import type { FileSystemWatcher, Uri } from 'vscode';
import type { DescData } from './type';
import fg from 'fast-glob';
import { defineExtension, useEventEmitter } from 'reactive-vscode';
import { commands, FileDecoration, Uri as vscodeUri, window as vscodeWindow, workspace } from 'vscode';
import { getMatchedPath, mergeConfig, readConfig, transformerConfig, writeConfig } from './utils';

// @ts-expect-error - support badge length greater than 2 characters
FileDecoration.validate = (): void => {};

let allDecs: DescData = {};
const configMap: Map<string, DescData> = new Map();
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
  watcher.onDidChange(handelConfigChange);
  watcher.onDidDelete(handelConfigChange);

  // register command
  const disposable = commands.registerCommand('folder-desc.addDesc', actionAddDesc);

  context.subscriptions.push(watcher);
  context.subscriptions.push(decorationProvider);
  context.subscriptions.push(disposable);
});

function handelConfigChange(uri: Uri) {
  const newConfig = mergeConfig(configMap.get(uri.fsPath) || {}, readConfig(uri.fsPath));
  configMap.set(uri.fsPath, newConfig);
  const config = transformerConfig(uri.fsPath, newConfig);

  allDecs = { ...allDecs, ...config };

  for (const url in config) {
    const u = vscodeUri.file(url);
    changeEmitter.fire(u);
  }
}

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

  if (allDecs[uriPath]) {
    allDecs[uriPath].description = desc || '';
  } else {
    allDecs[uriPath] = { description: desc || '' };
  }

  writeConfig(matchedPath, uriPath, desc);
}

async function readAllDecs() {
  const rootUris = workspace.workspaceFolders?.map(folder => folder.uri.path);
  if (!rootUris)
    return {};

  const allConfigFiles: string[] = await Promise.all(rootUris.map(async (rootUri) => {
    return fg.async([`${rootUri}/**/.vscode/folder-desc.json`, '!**/node_modules/**'], { onlyFiles: true });
  })).then(files => files.flat());

  const allConfigs: DescData = allConfigFiles.reduce((acc, filePath) => {
    const tempConfig = readConfig(filePath);
    configMap.set(filePath, tempConfig);
    const config = transformerConfig(filePath, tempConfig);
    return { ...acc, ...config };
  }, {} as DescData);

  return allConfigs;
}

export { activate, deactivate };

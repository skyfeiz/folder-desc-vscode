import type { Uri } from 'vscode';
import type { DescData } from './type';
import fg from 'fast-glob';
import { defineExtension, useEventEmitter } from 'reactive-vscode';
import { commands, FileDecoration, window as vscodeWindow, workspace } from 'vscode';
import { getMatchedPath, readConfig, writeConfig } from './utils';

// @ts-expect-error - support badge length greater than 2 characters
FileDecoration.validate = (): void => {};

let allDecs: DescData = {};
const changeEmitter = useEventEmitter<undefined | Uri | Uri[]>([]);

const { activate, deactivate } = defineExtension(async (context) => {
  // read all config
  allDecs = await readAllDecs();

  vscodeWindow.registerFileDecorationProvider({
    onDidChangeFileDecorations: changeEmitter.event,
    provideFileDecoration: (uri) => {
      const json = allDecs[uri.path];

      if (json) {
        return new FileDecoration(json.description, json.tooltip || '');
      }
    },
  });

  // register command
  const disposable = commands.registerCommand('folder-desc.addDesc', actionAddDesc);

  context.subscriptions.push(disposable);
});

async function actionAddDesc(uri: Uri) {
  const rootUris = workspace.workspaceFolders?.map(folder => folder.uri.path);

  const matchedPath = getMatchedPath(rootUris, uri.path);

  if (uri.path === matchedPath) {
    vscodeWindow.showInformationMessage('This is a root folder(not support to add description)');
    return;
  }

  const desc = await vscodeWindow.showInputBox({
    prompt: 'Please enter the description',
    value: '',
  });

  writeConfig(matchedPath, uri.path, desc || '');

  if (allDecs[uri.path]) {
    allDecs[uri.path].description = desc || '';
  } else {
    allDecs[uri.path] = { description: desc || '' };
  }

  changeEmitter.fire(uri);
}

async function readAllDecs() {
  const rootUris = workspace.workspaceFolders?.map(folder => folder.uri.path);
  if (!rootUris)
    return {};

  const allConfigFiles: string[] = await Promise.all(rootUris.map(async (rootUri) => {
    return fg(`${rootUri}/**/.vscode/folder-desc.json`, {
      onlyFiles: true,
    });
  })).then(files => files.flat());

  const allConfigs: DescData = allConfigFiles.reduce((acc, filePath) => {
    const config = readConfig(filePath);
    return { ...acc, ...config };
  }, {} as DescData);

  return allConfigs;
}

export { activate, deactivate };

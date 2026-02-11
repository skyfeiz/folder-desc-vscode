import { defineExtension } from 'reactive-vscode';
import { commands, window as vscodeWindow } from 'vscode';

const { activate, deactivate } = defineExtension((context) => {
  const disposable = commands.registerCommand('folder-desc.addDesc', () => {
    // 输出hello world
    vscodeWindow.showInformationMessage('Hello World');
  });

  context.subscriptions.push(disposable);
});

export { activate, deactivate };

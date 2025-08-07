import * as vscode from "vscode";

const CONFIG_KEY = "transparentDirectories.keep"; // "active" | "open"

export function activate(context: vscode.ExtensionContext) {
  const refreshExplorer = async () => {
    await vscode.commands.executeCommand(
      "workbench.files.action.collapseExplorerFolders"
    );

    const mode = vscode.workspace
      .getConfiguration()
      .get<string>(CONFIG_KEY, "active");

    const targets =
      mode === "open"
        ? vscode.window.visibleTextEditors.map((e) => e.document.uri)
        : vscode.window.activeTextEditor?.document.uri
        ? [vscode.window.activeTextEditor.document.uri]
        : [];

    for (const uri of targets) {
      await vscode.commands.executeCommand("revealInExplorer", uri);
    }
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(refreshExplorer),
    vscode.workspace.onDidOpenTextDocument(refreshExplorer),
    vscode.workspace.onDidCloseTextDocument(refreshExplorer),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEY)) refreshExplorer();
    })
  );

  refreshExplorer();
}

export function deactivate() {}

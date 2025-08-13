import * as vscode from "vscode";
import * as path from "path";
import { KEEP_CONFIG_IDENTIFIER } from "./constants/variabels";
import { getKeepConfiguration } from "./constants/functions";

export function activate(context: vscode.ExtensionContext) {
  onStartUp();

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(refreshExplorer),
    vscode.workspace.onDidOpenTextDocument(refreshExplorer),
    vscode.workspace.onDidCloseTextDocument(refreshExplorer),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(KEEP_CONFIG_IDENTIFIER)) {
        refreshExplorer();
      }
    })
  );
}

/**
 * Upon initialization all folders in the explorer should be closed
 * Than based on the keep settings the proper folders should be reopened
 */
async function onStartUp() {
  await vscode.commands.executeCommand(
    "workbench.files.action.collapseExplorerFolders"
  );

  const mode = getKeepConfiguration();
  const targets = getTargets(mode);

  for (const uri of targets) {
    await vscode.commands.executeCommand("revealInExplorer", uri);
  }
}

/**
 *  Based on the keep settings the proper folders should be collapsed
 */
async function refreshExplorer() {
  const mode = getKeepConfiguration();
  const targets = getTargets(mode);
  const chains = targets.flatMap((t) => ancestorChains(t));
  const directoriesToCollapse = (
    await Promise.all(chains.map((t) => getSubfolders(t)))
  )
    .flat()
    .filter((x) => targets.some((t) => !t.fsPath.startsWith(x.fsPath)));

  await vscode.commands.executeCommand("workbench.view.explorer");

  for (let i = 0; i < directoriesToCollapse.length; i++) {
    const currentDirectory = directoriesToCollapse[i];
    await vscode.commands.executeCommand("revealInExplorer", currentDirectory);
    await vscode.commands.executeCommand("list.collapse");
  }

  await vscode.commands.executeCommand(
    "revealInExplorer",
    vscode.window.activeTextEditor?.document.uri
  );
}

/**
 * Get the subfolders of a directory
 * @param root The root URI
 * @returns An array of uris for the subfolders
 */
async function getSubfolders(root: vscode.Uri): Promise<vscode.Uri[]> {
  const out: vscode.Uri[] = [];
  const entries = await vscode.workspace.fs.readDirectory(root);

  for (const [name, type] of entries) {
    if (type === vscode.FileType.Directory) {
      const child = vscode.Uri.joinPath(root, name);
      out.push(child);
    }
  }

  return out;
}

/**
 * Generates all ancestor folder paths for a given file-system path.
 * @param root A file-system uri.
 * @returns An array of folder uris, e.g. for "a/b/c/file.txt" returns:
 *   [
 *     {... path: "a" ...},
 *     {... path: "a/b" ...},
 *     {... path: "a/b/c" ...}
 *   ]
 */
function ancestorChains(root: vscode.Uri): vscode.Uri[] {
  const ws = vscode.workspace.getWorkspaceFolder(root);
  const folder = vscode.Uri.file(path.dirname(root.fsPath));
  let out = [folder];
  let parentDirectory;

  if (ws) {
    do {
      parentDirectory = vscode.Uri.file(
        path.dirname(parentDirectory?.fsPath ?? folder.fsPath)
      );
      out.push(parentDirectory);
    } while (parentDirectory.fsPath.startsWith(ws.uri.fsPath + path.sep));

    return out;
  }

  //@TODO: Implement no ws

  return out;
}

/**
 * Get the file URIs based on the mode parameter.
 * @param mode Should come from the settings. Open for all open files or active for only the currently active file.
 * @returns A list of URIs for the files.
 */
function getTargets(mode: "open" | "active"): vscode.Uri[] {
  return mode === "open"
    ? vscode.window.visibleTextEditors.map((e) => e.document.uri)
    : vscode.window.activeTextEditor?.document.uri
    ? [vscode.window.activeTextEditor.document.uri]
    : [];
}

export function deactivate() {}

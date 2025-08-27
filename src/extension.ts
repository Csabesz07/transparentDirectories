import * as vscode from "vscode";
import * as path from "path";
import {
  KEEP_CONFIG_IDENTIFIER,
  RECURSION_CONFIG_IDENTIFIER,
} from "./constants/variabels";
import {
  getFileExcludeConfiguration,
  getKeepConfiguration,
  getRecursionConfiguration,
} from "./constants/functions";
import { KeepOption } from "./constants/types";

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(refreshExplorer),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration(KEEP_CONFIG_IDENTIFIER) ||
        e.affectsConfiguration(RECURSION_CONFIG_IDENTIFIER)
      ) {
        refreshExplorer();
      }
    })
  );
}

/**
 *  Based on the keep settings the proper folders should be collapsed
 */
async function refreshExplorer() {
  const mode = getKeepConfiguration();
  const targets = getTargets(mode);
  const chains = targets.map((t) => ancestorChains(t));
  const directoriesToCollapse = (
    await Promise.all(
      chains.flatMap(({ chains, ws }) =>
        chains.map(async (t) => await getSubfolders(t, ws))
      )
    )
  ).flat();

  const directoriesToCollapseUnique = Array.from(
    new Map<string, vscode.Uri>(directoriesToCollapse.map((x) => [x.fsPath, x]))
  );

  const filteredDirectoriesToCollapse = directoriesToCollapseUnique.filter((x) =>
    targets.every((t) => !t.fsPath.startsWith(x[0]))
  );

  const recursion = getRecursionConfiguration();

  for (const [_, uri] of filteredDirectoriesToCollapse) {
    await vscode.commands.executeCommand(
      recursion
        ? "explorer.collapseResourceRecursive"
        : "explorer.collapseResource",
      uri
    );
  }
}

/**
 * Get the subfolders of a directory
 * @param root The root URI
 * @param ws Optional workspace-scope URI (for multi-root)
 * @returns An array of uris for the subfolders
 */
async function getSubfolders(
  root: vscode.Uri,
  ws?: vscode.Uri
): Promise<vscode.Uri[]> {
  const out: vscode.Uri[] = [];

  // const includeGitignoreEntries = getGitignoreExcludeConfiguration();
  const excludeRegexes = getFileExcludeConfiguration(ws).map((f) =>
    globToRegExp(f)
  );

  const allEntries = await vscode.workspace.fs.readDirectory(root);

  // @TODO: Implement .gitignore file exclude

  for (const [name, type] of allEntries) {
    if (type !== vscode.FileType.Directory) {
      continue;
    }

    const child = vscode.Uri.joinPath(root, name);

    const rel = vscode.workspace
      .asRelativePath(child, false)
      .replace(/\\/g, "/");

    const relAlt = rel.startsWith("/") ? rel : "/" + rel;

    const isExcluded = excludeRegexes.some(
      (re) =>
        re.test(rel) ||
        re.test(rel + "/") ||
        re.test(relAlt) ||
        re.test(relAlt + "/")
    );

    if (!isExcluded) {
      out.push(child);
    }
  }

  return out;
}

/**
 * Generates all ancestor folder paths for a given file-system path and assigns the workspace if any exists.
 * @param root A file-system uri.
 * @returns An array of folder uris and their ws if any exists
 */
function ancestorChains(root: vscode.Uri): {
  chains: vscode.Uri[];
  ws?: vscode.Uri;
} {
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

    return { chains: out, ws: ws.uri };
  }

  return { chains: [] };
}

/**
 * Get the file URIs based on the mode parameter.
 * @param mode Should come from the settings. Open for all open files or active for only the currently active file.
 * @returns A list of URIs for the files.
 */
function getTargets(mode: KeepOption): vscode.Uri[] {
  return mode === "open"
    ? getAllOpenFileUris()
    : vscode.window.activeTextEditor?.document.uri
    ? [vscode.window.activeTextEditor.document.uri]
    : [];
}

/**
 * Convert a pattern into a regex
 * @param glob The pattern which should be turned into a regex pattern
 * @returns A regext pattern from the provided glob
 */
function globToRegExp(glob: string): RegExp {
  const esc = (s: string) => s.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");

  let rx = "^";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*") {
      if (glob[i + 1] === "*") {
        rx += ".*";
        i++;
      } else {
        rx += "[^/]*";
      }
    } else if (ch === "?") {
      rx += ".";
    } else {
      rx += esc(ch);
    }
  }
  rx += "$";
  return new RegExp(rx);
}

function getAllOpenFileUris(): vscode.Uri[] {
  const out: vscode.Uri[] = [];
  const seen = new Set<string>();
  const add = (u?: vscode.Uri) => {
    if (!u) {
      return;
    }

    const key =
      process.platform === "win32"
        ? (u.fsPath || u.toString()).toLowerCase()
        : u.fsPath || u.toString();

    if (!seen.has(key)) {
      seen.add(key);
      out.push(u);
    }
  };

  for (const ed of vscode.window.visibleTextEditors) {
    add(ed.document.uri);
  }

  // @TODO: Include vscode.window.tabGroups.all as an option:
  // for (const group of vscode.window.tabGroups.all) {
  //   for (const tab of group.tabs) {
  //     const input = tab.input as any;
  //     if (input && input.uri) add(input.uri);
  //   }
  // }

  for (const tab of vscode.window.tabGroups.activeTabGroup.tabs) {
    const input = tab.input as any;

    if (input && input.uri) {
      add(input.uri);
    }
  }

  return out;
}

export function deactivate() {}

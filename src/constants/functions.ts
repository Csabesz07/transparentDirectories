import * as vscode from "vscode";
import {
  EXCLUDE_GITIGNORE_CONFIG_IDENTIFIER,
  KEEP_CONFIG_IDENTIFIER,
  RECURSION_CONFIG_IDENTIFIER,
} from "./variabels";
import { KeepOption } from "./types";

/**
 * Get the keep configuration's current value
 * @returns 'active' or 'open' based on the 'transparentDirectories.keep' setting
 */
export function getKeepConfiguration(): KeepOption {
  return vscode.workspace
    .getConfiguration()
    .get<KeepOption>(KEEP_CONFIG_IDENTIFIER, "active");
}

/**
 * Get the recursion configuration's current value
 * @returns Boolean based on the 'transparentDirectories.recursive' setting
 */
export function getRecursionConfiguration(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get<boolean>(RECURSION_CONFIG_IDENTIFIER, false);
}

/**
 * Get the list of files and directories which are excluded by the user
 * @param scope The workspace Uri
 * @returns An array of string with the names of patterns
 */
export function getFileExcludeConfiguration(scope?: vscode.Uri): string[] {
  const map =
    vscode.workspace
      .getConfiguration("files", scope)
      .get<Record<string, boolean | { when: string }>>("exclude", {}) ?? {};

  return Object.entries(map)
    .filter(([, v]) => v === true)
    .map(([glob]) => glob);
}

/**
 * Get the gitignore file entries display configuration
 * @returns Boolean based on the 'files.excludeGitIgnore' setting
 */
export function getGitignoreExcludeConfiguration(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get<boolean>(EXCLUDE_GITIGNORE_CONFIG_IDENTIFIER, false);
}

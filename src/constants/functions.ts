import * as vscode from "vscode";
import { KEEP_CONFIG_IDENTIFIER } from "./variabels";

/**
 * Get the keep configuration's current value
 * @returns 'active' or 'open' based on the 'transparentDirectories.keep' setting
 */
export function getKeepConfiguration(): "open" | "active" {
  return vscode.workspace
    .getConfiguration()
    .get<"active" | "open">(KEEP_CONFIG_IDENTIFIER, "active");
}

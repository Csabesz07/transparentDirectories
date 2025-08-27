<p align="center">
  <img alt="transaprent directories logo" width="25%" src="./public/transparentDirectoriesLogo.png">
</p>

# Transparent Directories

This is the README for the **Transparent Directories** extension. It keeps the Explorer tidy by collapsing folders that don’t contain the **active file** (or any **open files**, if you prefer). The result is a focused, “transparent” project tree where only the relevant paths stay expanded.

## Features

- **Auto-collapse on file change**  
  Whenever the active editor changes, the Explorer collapses folders that don’t contain the active file (or, optionally, any visible editors).

- **Two keep modes**

  - **`active`** – keep only the active file’s folder and its ancestors open.
  - **`open`** – keep the folders of **all open editors** (and their ancestors) open.

- **Multi-root aware**  
  Works across all folders in a multi-root workspace.

- **Low flicker**  
  Minimizes UI churn by collapsing only folders outside the “keep” set.

![Alt Text](./public/transparentDirectoriesDemo.gif)

## Requirements

- Visual Studio Code **1.102.0** or newer.

## Extension Settings

This extension contributes the following setting:

- `activeFolderManager.keep`  
  Choose what to keep expanded in the Explorer.

  - **`active`** (default): keep only the current file’s folder (and its ancestors) expanded.
  - **`open`**: keep all folders that contain **any** currently open editors (and their ancestors) expanded.

- `transparentDirectories.recursion`  
  **Boolean** (default: `false`). When `true`, the extension collapses **all subfolders** under each non-kept branch (recursive). When `false`, it collapses **only the top-level** directory of each non-kept branch.

**Example `settings.json`:**

```json
{
  "transparentDirectories.keep": "open",
  "transparentDirectories.recursion": true
}
```

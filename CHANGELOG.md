# Change Log

All notable changes to the "transparentDirectories" extension will be documented in this file.

This project follows the format suggested by [Keep a Changelog](http://keepachangelog.com/).

## [0.0.1] - 2025-08-25

### Added
- Initial release of **transparentDirectories**.
- Automatic Explorer pruning: keeps only the active file’s folder (or all open files’ folders) and their ancestors expanded.
- Setting `activeFolderManager.keep` with modes:
  - `active` (default): keep only the current file’s folder chain.
  - `open`: keep folder chains for all open editors.
- Setting `transparentDirectories.recursion`: when `true`, collapses entire subtrees; when `false`, collapses only the top-level unwanted folders.
- Multi-root workspace support.
- Respects `files.exclude` filters when enumerating folders.

### Known Limitations
- `.gitignore` filtering not yet applied (planned).
- Non-text editors (e.g., images/PDFs) not yet included in “open editors” logic (planned).


## [Unreleased]

- `.gitignore` filtering not yet applied.
- Non-text editors (e.g., images/PDFs) not yet included in “open editors” logic.
- Initial release
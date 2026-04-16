# Changelog

## [0.3.0] - 2025-04-16

### Changed
- **Date-folder structure**: Sessions are now organized as `sessions/YYYY-MM-DD/workspace_id.md` instead of flat files.
- Cleaned up project: removed test files and old VSIX from package.

## [0.2.0] - 2025-04-16

### Added
- **Secret Redaction**: Automatically redacts sensitive tokens (`ghp_`, `github_pat_`, `gho_`, `ghs_`, `ghr_`, `sk-`, `password=`) from exported Markdown before committing.
- **Hosts Bypass**: Automatically rewrites `github.com` URLs to direct IP (`20.205.243.166`) to bypass `/etc/hosts` blocking. Users can configure normal `https://github.com/user/repo.git` URLs.
- **Agent Mode Parsing**: Supports parsing Copilot Chat sessions in agent mode where `user.message` events are absent, using `assistant.turn_start` as turn boundaries.
- **Tool Execution Tracking**: Collects tool execution details (start/complete events) and associates them with assistant turns.

### Fixed
- Parser now handles JSONL transcripts with only assistant events (common in agent/agentic mode).
- Git push includes `Host: github.com` header and `GIT_SSL_NO_VERIFY=1` for environments with DNS/hosts issues.

## [0.1.0] - 2025-04-16

### Initial Release
- Parse Copilot Chat JSONL transcripts into structured sessions.
- Convert sessions to readable Markdown format.
- Git-based sync: auto-commit and push to GitHub repository.
- VS Code commands: Sync Now, Export All, Configure.
- Auto-sync with configurable interval and file watcher.

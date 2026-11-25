# Local setup and terminal operation

## Install from the supplied checkout

Run commands in the app root, not inside the skill folder. Inspect the README and package.json. Use Node.js 22+ and npm. The first installation needs network access.

```sh
npm ci
npm run doctor
npm run dev
```

Doctor checks Node, local Bun/HyperFrames, FFmpeg/ffprobe, disk/storage and Chromium launch. If Chromium is missing, run `npx playwright install chromium`, then rerun doctor. If FFmpeg is missing, install it through the system's supported package manager, including ffprobe. Do not run a remote shell installer or change the user's global Node installation without considering existing projects. Report a specific missing prerequisite if it cannot be resolved locally.

Use the printed URL and keep the server process alive. If the default port 4310 is occupied, GET `/api/health` and confirm `app: doro-creator-toolkit` before using it. For a separate instance set both PORT and an absolute ACC_WORKSPACE ending in a project directory; exports and branding are stored beside that directory. Never start two servers against the same workspace. Set ACC_URL on subsequent CLI/MCP calls to match the chosen port.

No global HyperFrames/Bun install, generation API key, Doro login or MCP registration is required for this workflow. The README supplies optional stdio MCP configuration. Do not overwrite the user's agent configuration to register the skill; repository instructions can be read directly. A chat-only environment cannot install software on the user's computer.

## CLI when MCP is unavailable

The CLI handles JSON requests. Paths omit `/api`; the current CLI supports GET/POST without query strings. Write request bodies to JSON files; avoid embedding content in shell strings. Use `npm run --silent cli -- ...` when parsing stdout as JSON. The process exits nonzero for HTTP errors.

| Task | CLI arguments after `npm run --silent cli --` |
| --- | --- |
| Discover | `request GET /capabilities` |
| List / read | `request GET /projects` or `request GET /projects/PROJECT_ID` |
| Create | `request POST /projects create.json` |
| Edit | `request POST /projects/PROJECT_ID/commands edit.json` |
| Review | `request POST /projects/PROJECT_ID/validate` |
| Export | `request POST /projects/PROJECT_ID/exports export.json` |
| Poll | `request GET /exports/JOB_ID` |
| Export history | `request GET /projects/PROJECT_ID/exports` |

For exact schemas read `tools/carousel/templates/src/coffee.ts` (create), `tools/carousel/core/src/schema.ts` (edits), `tools/carousel/core/src/publishing.ts` (post details), and `tools/carousel/exports/src/index.ts` (exports). These paths are relative to the app root. With MCP, discover tool schemas instead. Capability metadata does not include the full edit schema.

Creation body: title plus optional outline entries `{headline, body}`, brand, canvas and requestId. Do not combine outline with templateId. Editing body: expectedRevision, requestId and commands. Project ID is in the CLI path, not the JSON edit body. Export body: expectedRevision, format, quality and requestId. Use actual returned IDs/revisions, never placeholders. Save request JSON and UUIDs outside the live project store so retries can reuse them.

The returned job starts queued. Poll about every two seconds until completed, failed or cancelled; retain its ID and use a bounded wait. Use the job's actual files and outputDirectory rather than guessing paths. GET downloads and binary ZIP import require MCP or a local HTTP client, not this JSON-only CLI. This is local application access, never a substitute for Doro MCP.

## Completion

Return the live review link, ordered image ZIP, PDF if requested and editorial review evidence. Ensure the reviewed export matches the saved project revision. Keep output on disk and the requested preview server running. A clean dependency install on an already configured Mac is not proof of a fresh machine or another OS.

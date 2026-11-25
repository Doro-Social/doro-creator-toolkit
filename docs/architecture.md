# Architecture and boundaries

Doro Creator Toolkit is a local, agent-first content workspace. React/Vite supplies the review and editing UI. The Express server owns validated project mutations, revisions, history, local storage and export jobs. CLI and stdio MCP tools use that same server; no embedded model service or model API key is needed.

## Code map

- `apps/studio`: editor, project library, templates, motion library, branding, review and exports.
- `packages/core`: strict schemas, revision-checked commands, recovery journals, portable bundles and review rules.
- `packages/agent-tools` and `packages/cli`: local agent entry points.
- `packages/templates` and `packages/motion`: editable starting points, treatments and gallery reference metadata.
- `packages/rendering` and `packages/exports`: shared slide rendering, pinned HyperFrames adapter, asynchronous exports and local handoff packets.
- `packages/media`: normalized artwork and restricted SVG logo ingestion.
- `skills/carousel-creator`: operating guidance for installation, authoring, review and export.

## Data and external actions

Projects, original user content, exports, receipts and credentials are excluded from source control. `.workspace` and `.artifacts` are local only. Do not persist raw edits behind the running server; use its revision-checked operations. Local creation/export needs no Doro connection. A local handoff packet is not an upload or remote draft. Sending requires separately connected Doro MCP tools and approval of the exact destination and content.

## Current limits

The gallery demonstrates custom scenes. Six editable treatments are supported: none, rise, fade, snap-zoom, headline-storm and checklist-pop. These do not reproduce entire gallery films. Motion quality still needs human review; a successful export is not evidence of compelling content. Silent reading holds and entrance replay are intentional, but pacing should be tailored to each piece.

Cross-platform and unfamiliar-user validation are incomplete. Test scripts create local fixtures; use isolated workspaces. This initial source import is a development baseline, not a launch-readiness claim.

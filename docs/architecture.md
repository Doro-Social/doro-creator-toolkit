# Architecture and boundaries

Doro Creator Toolkit is a local, agent-first content workspace. React/Vite supplies the review and editing UI. The Express server owns validated project mutations, revisions, history, local storage and export jobs. CLI and stdio MCP tools use that same server; no embedded model service or model API key is needed.

## Repository map

```text
apps/studio/             Browser entry point and Vite app types
tools/carousel/         Existing carousel capability (details below)
packages/agent-tools/    Shared stdio MCP entry point
packages/cli/            Shared terminal entry point and doctor
packages/local-server/   Local HTTP service and process lifecycle
packages/media/          Image normalization and restricted SVG ingestion
packages/common/         Error type shared by media and carousel operations
packages/studio-ui/      Existing studio shell, icons and global styles
skills/carousel-creator/ Agent instructions for the carousel workflow
public/                 Served static fonts, brand assets and gallery media
config/                 Shared theme tokens
tests/                  Toolkit startup checks and shared test-server helper
```

### Carousel ownership

`tools/carousel/` owns its domain schemas and persistence (`core`), templates, motion catalog/treatments, rendering, exports, React workflow/editor (`ui`), tests and authored examples. Its browser workspace is mounted by `apps/studio/src/main.tsx`. The renderer consumes the same tool-owned SlideCanvas component and stylesheet as the preview.

The local server and MCP entry point currently register carousel operations directly. They remain shared entry points; this refactor does not introduce a plugin loader or pretend another tool exists. Routes, MCP tool names, CLI commands, environment variables, saved project schemas and workspace locations remain unchanged.

Static assets remain in `public` to preserve existing URLs and portable export font paths. Their source examples are under `tools/carousel/examples`; brand/font notices are retained. Runtime caches and rendered test output stay outside source control.

### Adding capabilities later

Add an actual capability under `tools/<name>` when it exists, with its domain code and tests together. Add a skill under `skills/<name>` when an agent workflow needs one; a skill need not have a UI or backend. Keep reusable infrastructure in `packages`, and extract shared behavior when there is a concrete consumer. Do not add empty future-tool folders, speculative interfaces or platform-wide hierarchies.

Tool code may depend on shared packages, but shared media/common/UI utilities must not import carousel domain code. The server and agent registration layers are composition points and may import the tools they expose. Shared UI currently presents the existing carousel navigation; extend it when another real capability is added.

## Data and external actions

Projects, original user content, exports, receipts and credentials are excluded from source control. `.workspace` and `.artifacts` are local only. Do not persist raw edits behind the running server; use its revision-checked operations. Local creation/export needs no Doro connection. A local handoff packet is not an upload or remote draft. Sending requires separately connected Doro MCP tools and approval of the exact destination and content.

## Current limits

The gallery demonstrates custom scenes. Six editable treatments are supported: none, rise, fade, snap-zoom, headline-storm and checklist-pop. These do not reproduce entire gallery films. Motion quality still needs human review; a successful export is not evidence of compelling content. Silent reading holds and entrance replay are intentional, but pacing should be tailored to each piece.

Cross-platform and unfamiliar-user validation are incomplete. Test scripts create local fixtures; use isolated workspaces. This initial source import is a development baseline, not a launch-readiness claim.

# Doro Creator Toolkit

A local, agent-first carousel workspace by DoroSocial. Your coding agent creates and edits drafts; you review them in the browser and export files. This is a working development preview, not a public release.

## Start with your agent

Give your coding agent this checkout and a topic:

> Read skills/carousel-creator/SKILL.md, install and start this app, and create a carousel about [topic] for [audience]. Review every slide, then give me the local preview link. Do not publish.

The skill is included in the repository. No hosted AI service or model API key is required by this app. Your agent needs local terminal access; a chat-only assistant cannot install it on your computer.

## Install and run

Requires Node.js 22 or later and npm. Clone the repository, then run from its root:

```sh
git clone https://github.com/Doro-Social/doro-creator-toolkit.git
cd doro-creator-toolkit
npm ci
npm run doctor
npm run dev
```

If doctor reports a missing export browser, run `npx playwright install chromium`, then retry. Open the server's printed URL, normally http://127.0.0.1:4310. Stop with Ctrl+C. If occupied, choose another PORT and set ACC_URL for agent tools accordingly. Do not stop unrelated applications.

The first install requires internet. HyperFrames 0.8.224 and Bun 1.4.4 are project-local dependencies; no global installation is required. Doctor checks runtime, FFmpeg/ffprobe, writable storage, free disk space and browser launch. Run npm run test:render for an actual renderer test. macOS is the verified environment; clean-machine and other OS validation remain open.

## Repository organization

Carousel implementation, UI, templates, motion, rendering, exports, tests and source examples live in [`tools/carousel`](tools/carousel/README.md). The browser entry point stays in `apps/studio`; common infrastructure stays in `packages`; agent skills stay in `skills`. Only existing capabilities have folders. See [architecture and boundaries](docs/architecture.md) for ownership and extension guidance.

## Working features

- Custom slide photos and business logos: JPEG/PNG/WebP up to 10 MB, plus simple SVG business logos up to 1 MB, fit/fill framing and focal-point controls. Images are normalized to at most 2000 px and embedded locally.
- Projects with editable copy, brand colors/name, illustrations, slide ordering, duplication, saved-edit undo/redo and recoverable trash.
- Four complete fictional Rill Coffee examples: education, announcement, showcase and story. Creating a copy never changes the template. Six slide layouts (editorial, statement, product spotlight, checklist, comparison and call to action) retain content when switched.
- Six canvas presets: 1080×1350, 1080×1080, 1080×1920, 1080×1440, 1200×628 and 1920×1080. Custom sizes span 320–4096 px. Creating a size variant preserves the original project.
- Shared preview/export layout, safe guides, overflow validation, static slides and rise/fade entrances with manual playback.
- Ordered JPEG or PNG images, multipage PDF, continuous MP4, or per-slide clips with still alternatives. Export jobs have progress, cancellation, retained history, downloads, ZIP bundles and manifests identifying the saved revision.
- Browser draft recovery after refresh. Saving is explicit. Export uses the saved revision; save pending changes first.
- 21 Rill Coffee motion examples in the animation gallery. These are inspiration, not generic export presets. Editable projects support none/rise/fade plus Snap Zoom, Headline Storm and Checklist Pop. The richer treatments adapt the direction to editable content; they do not reproduce the gallery films.

PDF and image exports show the complete still layout. Video uses the saved durations and motion settings. Video dimensions must be even. Export validation detects layout overflow and flags dense text; it does not replace editorial or visual review.

## Agent access

Start the app, then configure an MCP-compatible agent with absolute paths:

```json
{"mcpServers":{"doro-creator-toolkit":{"command":"/absolute/path/to/doro-creator-toolkit/node_modules/.bin/tsx","args":["/absolute/path/to/doro-creator-toolkit/packages/agent-tools/src/index.ts"],"env":{"ACC_URL":"http://127.0.0.1:4310"}}}}
```

Discover capabilities and tool schemas before acting. The 26 tools cover project/template creation, editing, duplication, validation, export/poll/cancel, history, import and trash. Read the current revision before a mutation. Commands are validated as a batch; stale revisions are rejected. Use a UUID requestId for create_project and export_project. Repeating the same key and input returns the original result, including across restart. Different input with the same key is rejected. Creation replay returns its original snapshot; read_project afterward for the latest revision. edit_project, duplicate_project and import_project also accept a stable UUID requestId; bundle imports accept it as well. Exact retries return the original project snapshot without applying the operation again. Read the latest project afterward. Dry-run edits do not reserve a key. Other mutations still require reconciliation before retry.

A terminal-only agent can use the same API through the CLI:

```sh
npm run cli -- request GET /capabilities
npm run cli -- request POST /projects request.json
```

See [the agent skill](skills/carousel-creator/SKILL.md) for the complete creation/review/export workflow. Do not edit live project files behind the server.

## Local storage and recovery

Projects default to `.workspace/projects`; exports, history and trash stay locally under the workspace. Set ACC_WORKSPACE to an absolute project-storage directory to override. One server process must own a workspace. Back up the workspace; undo retains 30 snapshots and is not a substitute for backups. Project ZIP and JSON download/import carry normalized photos and logos as embedded WebP images. Keep original files separately; exports are not a lossless original-media archive. Interrupted jobs are marked failed on restart and can be exported again.

## Verification

```sh
npm test
npm run build
npm run test:browser
npm run test:mcp
npx tsx tools/carousel/tests/template-agent.ts
npx tsx tools/carousel/tests/export-http.ts
npx tsx tools/carousel/tests/export-agent.ts
npx tsx tools/carousel/tests/export-workflow.ts
```

Browser/MCP/HTTP tests need the running app and create verification projects. Export-workflow uses isolated `.artifacts` storage and runs a real video render. See [architecture and boundaries](docs/architecture.md).

## Still ahead

Additional business collections and layouts, reusable advanced motion treatments, retry receipts for the remaining mutations, and browser-owned Doro authentication/publishing are not implemented. Platform publishing is not implied by exporting files. The source is MIT licensed, as selected for this repository. Third-party dependencies retain their own licenses. Broader release validation still includes dependency review and clean-machine/cross-platform checks.

## Add your own artwork

In the slide editor, open **Your photos & logo**. Choose a slide photo, select Fill the frame or Show the whole image, and adjust horizontal/vertical focus if needed. Add a description for the photo. A business logo applies across the project without stretching. Save changes before exporting. Remove photo restores the slide's selected illustration.

Agents can call `import_image` with an absolute local `filePath`, `alt`, `projectId`, `expectedRevision`, `target` (photo or logo), and `slideId` for photos. It attaches the artwork directly and returns a compact revision receipt. Agents can adjust framing through editSlide using the saved photo object. Terminal-only agents can POST base64 plus alt to /media (include kind:logo for SVG), then assign the normalized result through revision-checked commands.

Slide photos accept still JPEG/PNG/WebP under 40 megapixels. Business logos also accept simple SVG up to 1 MB: outlined shapes and local gradients, without scripts, external references, CSS styles, embedded images, filters or live text. Convert text to outlines or export a transparent PNG for unsupported artwork. SVG logos are rasterized locally up to 2000 px for sharp reuse; original SVG source is not embedded. Files are re-encoded to WebP with orientation applied and metadata stripped. Transparency is preserved. Highly detailed images whose normalized size exceeds 1 MB must be resized. Embedded artwork makes project files/history larger; browser draft recovery can hit browser storage limits, so save to disk regularly.

Verification: `npx tsx tools/carousel/tests/media-workflow.ts` covers UI uploads, direct MCP attachment, framing, portable reimport, PDF and video export.

Template verification: `npx tsx tools/carousel/tests/collection-browser.ts` exercises all four gallery-to-editor flows. `npx tsx tools/carousel/tests/collection-workflow.ts` exports every example in portrait, square and widescreen and renders a font-comparison video. Sample display type is bundled Fraunces under OFL-1.1; app UI typography is unchanged.

## Reuse a brand

Open a project’s Brand section. Set its name, colors, logo and typography, then choose Save branding as new kit. Select a saved kit and Apply kit to draft, then Save changes. Update selected kit from draft deliberately replaces that kit; existing projects remain unchanged. Saved kit files live beside projects in the local workspace’s brands directory.

Agents use list_brand_kits, save_brand_kit and apply_brand_kit. Updates require the kit revision; applying requires the project revision. Applying copies the brand and is undoable. Typography choices are editorial (Fraunces + Geist) and modern (Geist). Custom font upload, kit removal and a standalone kit management screen are not implemented.

## Prepare post copy

Open Post details in a project. Write a separate public PDF document title, captions and hashtags for each destination, plus optional private organization tags. Save changes before exporting. Copy caption + hashtags copies only that platform's public text. Every export of a project with post details includes captions.txt and publishing.json, also included in the ZIP. Internal tags remain in project/publishing JSON and never enter captions.txt.

PDF title metadata uses the document title; a blank title becomes “Carousel”, never the internal project name. Caption storage allows 5000 characters as an app limit, not a destination guarantee. This feature does not validate current social platform limits or publish/schedule anything. Destination availability in the caption selector is not evidence of Doro support.

## Outline and sequence review

Choose Paste a slide outline from Projects. Use the first line as a heading and following lines as body text; separate slides with a line containing `---`. Review proposed boundaries/count and choose a size before creating. Agents can pass structured outline entries to create_project. Review all slides opens a complete overview; Play sequence plays saved slide durations, and clicking a card returns to that slide. Reduced-motion preferences retain complete stills.

## Doro handoff policy

Creation, editing and exports remain free and do not require Doro sign-in. A connection is required only when sending content to Doro. After an image export, Prepare Doro handoff with my agent copies a review prompt. The prepare_doro_handoff tool verifies a current image export and hashes, requires explicit destinations and captions, and returns a local review packet. It does not upload or create remote drafts. The connected agent must discover the real account/capabilities and obtain approval of exact assets/copy before sending through Doro MCP. PDF/video handoff is not verified; those files remain downloadable.

## Agent context and recovery

read_project and list_projects omit embedded image bytes by default. Use read_project includeMedia:true only when full portable data is needed. To adjust an existing crop without the bytes, use photoFrame with slideId, fit, x and y. Normal mutation results are also compact. Do not pass compact image descriptors back as complete image objects.

Only one server may own a workspace. A second server is rejected; choose another workspace instead. Shutdown cancels and waits for export work. On tested macOS, owned renderer process groups receive termination; Windows descendant cleanup is not verified.

Fresh dependency installation was verified on this Mac in a separate path containing spaces and Unicode, followed by doctor, build and a real render. This reuses installed OS tools/browser caches and is not a fresh-machine or cross-OS certification.

## Portable project backups

In an editor, open **Back up project** and download a project ZIP after saving. From Projects, use **Import project** to select a ZIP or JSON, review its title, slide list, dimensions and media count, then import as a new project. Cancel leaves the workspace untouched. New identities preserve the original draft.

The ZIP contains a versioned manifest, project.json (with embedded normalized artwork) and README.txt. It preserves content, brand, canvas, slide order, timing, crop, brief and publishing metadata. Review private briefs and internal tags before sharing. Credentials, other workspace files, history and original full-resolution media are not included. It is separate from the rendered carousel.zip export.

Agents use export_project_bundle with projectId and a new absolute filePath. Existing files are never overwritten. import_project_bundle takes an absolute filePath and defaults to previewOnly:true; use false to create a copy. No remote Doro connection is involved. Agents can supply requestId for retry-safe imports. Reuse the same ID and input after a lost response; use a new ID for an intentional additional copy. Browser imports without a request key still require checking the project list before retrying.

Bundle version 1 supports project schema 1. Imports reject unknown fields/versions, unexpected archive paths, symlinks, encrypted entries, oversized content and project checksum mismatches. Archives are never extracted or executed. The limit is 48 MB. Future schema migrations remain unimplemented.

## Find a starting point

Templates support keyword search by name, description and purpose. Animations support keyword search and motion-category selection, with result counts and reset actions. Films remain looping creative references; filtering does not turn them into selectable project treatments. Agents use list_templates and list_animations with optional query/category, and discover available categories in the responses.

Verification: npm test, npm run build, npx tsx tools/carousel/tests/bundle-workflow.ts and npx tsx tools/carousel/tests/library-search.ts. Bundle round-trip tests include embedded photo/logo, crop, timing, order and independent identities in a separate workspace.

## Review and adjust a carousel

Open **Check carousel**, save your edits and choose **Run checks**. Results link to the affected slide and flag text overflow, low text/label contrast, repeated headings, missing photo descriptions and estimated video reading time. Timing suggestions can be applied individually or together as an undoable edit. Results become stale after edits and must be rerun. These checks do not verify factual accuracy, teaching quality, every overlap, fallback-font shaping or social-platform eligibility.

In **Text size & slide colors**, change heading/body size from 80–120%, align text left/center, and override the slide's background/text/accent colors. Reset controls return to layout sizing and the project brand. Brand kit updates preserve intentional slide overrides. The same settings render in JPEG, PDF and video. Text-size controls are not automatic fit: run checks and inspect at phone size.

**Motion for all slides** applies None, Gentle rise or Soft fade as a single undoable batch. Headings and branding remain visible at the beginning; supporting content animates over half a second. Complete stills remain available. Reading-time suggestions use a whitespace word count at 180 words/minute plus a one-second buffer and entrance time, so they are guidance for video, not a language-aware guarantee. Still-image/PDF readers set their own pace.

Cancelled/failed exports remove partial delivery files and derived video source, retaining the saved project snapshot and job receipt. Restart also cleans interrupted jobs. Completed exports are unaffected.


## Six reusable layouts

Choose a layout in the slide editor. Editorial teaches one idea, Statement opens with a clear promise, Product spotlight leads with an image, Checklist uses one body line per item, Comparison uses two sections separated by a blank line (first line is the section label), and Call to action highlights the closing action. Switching preserves all entered text, media and motion. Extra comparison sections remain visible and generate a review note rather than being discarded. Discover IDs and writing guidance in capabilities.layouts.

Verification covers all six canvas presets for the three new layouts, copy retention across all six layouts, editor save/reopen/undo at 1280px, a three-page PDF and a continuous MP4. These fixtures use short text; arbitrary dense content still needs checks and visual review. Existing four templates remain unchanged.


If a local project is damaged or uses a newer unsupported schema, Projects keeps healthy drafts accessible and shows recovery details. Originals are never rewritten by this scan. Restore a known project backup as a new copy. Agents can use inspect_library to inspect healthy projects and per-file issues when list_projects cannot read the workspace. Automatic format migration remains unimplemented.


## Interrupted edit recovery

Saved edit batches and undo/redo use a local recovery journal to commit project content and undo history together. Startup completes an interrupted journal before accepting requests. Edit retry receipts are committed with that journal. The browser retains a retry key for an unchanged Save attempt within the open session, so retrying a lost response does not create another revision. After a page refresh or changes to the pending draft, read/reconcile the saved revision before retrying. This is process-interruption recovery, not a guarantee against disk corruption or power failure; keep project backups.

Carousel checks also flag known fictional Rill Coffee references and explicit unfinished placeholders. These are review notes, not export blockers. They do not verify real prices, dates, addresses or factual claims, and they never rewrite copy automatically.

Font preflight reads the exact bundled carousel fonts and flags characters absent from the selected primary face. Notes identify the slide/field and sample characters. It preserves text and allows export because a device fallback may render it correctly. Check final files for unsupported scripts or emoji; this does not certify fallback availability, shaping, or cross-platform typography.

## Reusable motion treatments

Choose a treatment in the editor Style tab. Snap Zoom punches in on artwork (or a heading without artwork). Headline Storm converges short heading words. Checklist Pop reveals Checklist items in sequence; other layouts reveal the body together. Agents discover IDs and guidance in capabilities.editableMotions. Preview and video use the same choreography, and JPEG/PDF remain complete stills. Reading-time checks include the full entrance. Video page boundaries crossfade for 0.2 seconds; clips hold their final frame and replay their entrance when looped. Reduced-motion preview shows the complete still.

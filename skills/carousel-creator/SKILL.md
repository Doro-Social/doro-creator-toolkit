---
name: carousel-creator
description: Install and operate Doro Creator Toolkit locally, create and revise social carousels, inspect slide layouts, and export images, PDFs or videos through its shared tools.
---

# Doro Creator Toolkit

The user supplies a repository and a topic. Use this checkout to create a useful local carousel; the browser is the user's review surface. Do not install a hosted AI backend or ask for a generation API key.

## Creator experience

The creator supplies a repository link and a content request, not a setup checklist. Handle installation, startup, supported local operations and routine troubleshooting yourself within the available permissions. Explain progress in plain language and return a browser preview to review. Ask only for missing content facts or an action that genuinely requires the user; identify the exact action and why. Do not hand back terminal commands as the default next step or make optional MCP registration a prerequisite. If the environment cannot run local software, explain that limitation without pretending setup succeeded. On return visits, locate the existing installation and preserve saved projects rather than creating another copy.

## Setup

For a first install or terminal-only operation, follow [references/local-setup.md](references/local-setup.md). The skill ships with the checkout; reading it is sufficient to use it. It does not register itself in every agent or provide app-specific slash commands. MCP is optional for local creation.

Read the repository README. With Node 22+, run npm ci, npm run doctor, and npm run dev from the checkout. Use the returned local URL. If the browser is missing, run npx playwright install chromium. An occupied port does not authorize killing another process: try the existing app's /api/capabilities or choose another PORT. Keep the server running in the session. macOS is tested; other systems need verification. A chat environment without local execution cannot install this on the user's laptop.

Use the optional MCP configuration in [the technical guide](../../docs/technical-guide.md#optional-mcp-connection-and-cli-access) if already connected. Otherwise the command `npm run cli -- request GET /capabilities` exposes the same API. For POST bodies, write a JSON file and run `npm run cli -- request POST /projects request.json`. Never edit .workspace/project files directly. The CLI route omits the /api prefix. Set ACC_URL if using another port.

## Create and personalize

1. Discover capabilities, templates, canvas presets and animation reference readiness. Choose a relevant fictional café example from coffee-ordering, coffee-announcement, coffee-showcase and coffee-story; otherwise start a blank draft and create a coherent sequence. The animation gallery supplies visual vocabulary, not generic effect presets. Discover capabilities.editableMotions. Editable slides support none, rise, fade, snap-zoom, headline-storm and checklist-pop. These are reusable treatments, not exact replicas of the custom gallery films.
2. Ask only for essential missing facts. Use a clearly labeled fictional/demo brand if the user asks for a sample. Avoid inventing a real business's prices, testimonials, claims or availability. Choose a useful concrete outcome, introduce terms, and write a connected sequence. Default to 4:5, 2-10 slides, deliberate stills and a readable final takeaway.
3. create_project accepts title, templateId (optional), brand (optional full name/background/text/accent object) and canvas (optional width/height). Read returned IDs/revision. To add slides, supply UUIDs, eyebrow/headline/body, duration, motion and optional visual. Existing illustration choices are coffee-pair, espresso, americano, iced-americano and none.
4. edit_project applies commands atomically against expectedRevision. Commands include brief, brand, editSlide, addSlide, duplicateSlide, removeSlide, reorder and canvas. A revision conflict means reread and reconcile; do not silently overwrite the human. Use a stable UUID requestId for create_project, edit_project, duplicate_project, import_project, import_project_bundle and export_project. Persist the key with the exact request before sending. After an ambiguous response, retry that same input and key; mismatched reuse is rejected. Project replay returns the original snapshot, so read_project for the latest revision before further edits. Dry-run edits and bundle previews do not reserve keys. Other mutations, including image attachment, brand kits and undo/redo, still require read/reconcile before retry.
5. Inspect all slides at the review URL /?project=<id>. validate_project reports text/artwork fit, contrast, density, reading time, unfinished/demo copy and missing primary-font characters. Treat these as technical checks, not editorial approval. Ensure title, explanation and illustration agree; read at phone size. Prefer concise copy over shrinking type. Revisions are normal and do not require permission for each local correction.

## Editorial quality

Before layout, write a short learning brief and teaching review in an editorial-review.md sidecar beside this project, outside project.json. State the audience, useful outcome and scenario; check the sequence introduces terms before relying on them. Use direct, specific teaching copy, no invented facts, hype, em dashes or visible page numbers. A template is a starting point, not finished client content.

After rendering, separately inspect every slide in order at phone size, plus the hook, densest slide and closing action at full size. Record what each slide teaches, concrete defects and corrections, and the exact final export/revision reviewed. Re-export after repairs. This can be a self-review; do not claim an independent reviewer. Technical success alone does not establish editorial readiness.

For public captions, read the complete sequence first. Write destination-specific copy grounded in what it teaches, with a relevant action; keep internal labels out of public fields. Save post details before exporting so the files travel with the carousel.

## Export and review

Save first. export_project takes projectId, expectedRevision, format (jpg, png, pdf, video, clips), quality (standard, compact). Poll get_export every 2 seconds with a bounded wait; record the job ID if you need to resume. Failed/cancelled jobs have no downloadable files. cancel_export stops active work. Match job revision to the current draft; older output is stale.

Images are ordered with a ZIP, PDF is one slide per page at the selected ratio, video is one continuous MP4, clips includes individual MP4s for animated slides plus stills. A still-only clips job has images only. Inspect exported images and every PDF page; inspect opening, motion, reading hold and end of video. Export completion alone does not establish visual quality. Download URLs and absolute output directories appear in the job. Return the review URL and usable files.

Size variants should duplicate_project then apply canvas, preserving the original. Undo/redo and recoverable trash are local tools. Portable project JSON includes built-in illustrations and normalized embedded photos/logos. Preserve source originals separately.

## Doro boundary

The app can prepare a local Doro review packet, but has no browser-owned Doro sign-in or publishing. A separately connected agent can send through Doro MCP only when requested and approved. Local creation and exports need no Doro account. Do not fabricate a remote receipt or imply a PDF can be sent through an unverified connector.

## First post or returning brand

Use the business and audience already in the request. Check saved kits first. If a brand is named and unambiguous, apply its kit and browse its saved assets. If several businesses could match, ask which one this post is for. With a new business, ask briefly for any missing audience or topic and, if artwork would help, “Have a logo or photos you want to use? Share the files, point me to a folder, or we can start without them.” Look only in the location they choose. Ask about an ambiguous logo variant when it matters. A missing asset never blocks a draft.

Distinguish “use this in the post” from “save this for future posts.” For one-off files, use import_image. When the user wants reuse, save or select a named brand kit, apply it to the project, then use save_brand_asset with kitId, filePath, label and kind (logo, icon, photo or screenshot). Use list_brand_assets to find that brand’s images and apply_brand_asset with the latest project revision, kitId, assetId, target and slideId for a photo. Applying a logo changes this project; to make it the default for new posts, update the kit from the draft if requested. resolve_brand_asset returns the managed original local path for tools that need the full-resolution file. Keep other brands’ libraries separate and use the files the creator supplied.

Without MCP, use the CLI request routes in the technical guide and `npm run cli -- save-brand-asset <kitId> <kind> "<label>" "/absolute/path/to/image"`. The file stays local in both workflows.

## User artwork

Use import_image to attach a local image directly: filePath (absolute), alt, projectId, expectedRevision, target photo/logo, and slideId for photos. It returns a small revision receipt rather than base64 image data. Photos accept JPEG/PNG/WebP up to 10 MB and 40 megapixels. Logos also accept simple SVG under 1 MB: outlined shapes and local gradients only. CSS, external references, scripts, embedded images, clipping, filters and live text are unsupported; use a transparent PNG or outlined simpler SVG if rejected. Images are normalized to WebP at most 2000 px; original SVG source is not embedded. No remote image download is implied. Use user-provided artwork or assets with appropriate usage rights.

Photos override built-in illustrations without deleting the selection. A photo has src, alt, width, height, fit (cover/contain), x and y (0–100 focal point percentages). Preserve the image fields when adjusting framing. Set photo:null or brand.logo:null to remove. Logos apply to all slides. Check the subject stays visible in each selected ratio; contain is appropriate when the whole image matters. Save, export and inspect the actual output. Image descriptions do not make the PDF a tagged accessible document.

## Layouts and demo collection

Discover the four templates through capabilities. Each includes businessId, category, fictional designation and full starter content. Use template IDs for complete sequences; layout IDs are independent. Discover capabilities.layouts and set slide.layout to editorial, statement, spotlight, checklist, comparison or cta with editSlide. These retain text, media, branding and motion; inspect reflow after switching. A one-business dropdown is intentionally hidden. Fraunces is a bundled creative display font; do not identify it as the Doro UI brand font.

## Reusable branding

Use list_brand_kits before recreating a user's branding. save_brand_kit takes label and a full brand object; updates also require kitId and expectedRevision. apply_brand_kit takes projectId, kitId and the project's expectedRevision. It copies the kit values into the project; later kit edits never propagate automatically. A brand includes optional typography (editorial/modern) and optional embedded logo. Preserve existing logo and typography when editing other brand fields. Applying is an ordinary undoable brand command. Review contrast, wrapping and logo visibility after applying; saving a kit does not establish visual quality.

## Post details

Read every slide before drafting public copy. Keep internal project labels out of captions and document titles. Use edit_project with a publishing command whose publishing object contains documentTitle (up to 200 characters), posts (platform keys: instagram/linkedin/facebook/threads/tiktok/x/bluesky; each value has caption and hashtags array), and internalTags array. This command replaces the publishing object, so preserve other platform drafts when editing one. Captions have a 5000-character storage limit, not a verified platform limit.

Save before export. The PDF uses documentTitle, or neutral “Carousel” if blank. captions.txt contains public text only; publishing.json retains internal tags separately. Platform captions are drafts for manual review, not Doro compatibility or posting authorization. Do not invent copy from the project title alone or claim API publishing is implemented.

## Bulk creation and inspection

create_project accepts outline:[{headline,body},…] as an alternative to templateId. It creates independent slide IDs with still motion and a readable default hold. Use the browser import preview for human-entered outlines separated by --- lines. Review all slides in sequence, not only the selected slide.

read_project defaults to compact image descriptors (includeMedia:true gives full data). photoFrame edits cropping without transmitting image bytes. A compact descriptor is not a valid replacement image object. Preserve media through narrow commands.

## Doro handoff preparation

Local creation and exports never require a Doro connection. For an approved intended handoff, prepare_doro_handoff takes projectId, expectedRevision, jobId and explicit destinations. The result contains verified local images, hashes, exact caption text and a needs_account_and_approval state. It is not an upload receipt. Only JPG/PNG handoffs up to ten slides are supported locally; X/Bluesky selections require at most four. Do not silently shorten a carousel.

Read live Doro capabilities and connected account identity. Show the user the exact draft plan before upload. Use Doro MCP for content, signed-upload lifecycle and drafts. Transfer bytes only to signed storage URLs issued by MCP. Use stable remote idempotency keys and reconcile timeouts with get_operation_status. Read back remote IDs/status. Never schedule or publish as an incidental integration test. A PDF export does not establish LinkedIn document connector support.

For sequential multipart attachment to an existing content item, Doro requires content:update in addition to media:upload. Check current scope eligibility before starting where exposed. If a conditional scope error arrives after source creation, persist the source content ID, operation ID and stable idempotency keys; report the partial result and request reauthorization. Resume that same source after permission repair. Do not recreate content or switch transports to bypass the scope. Never store signed URLs/session tokens in durable receipts.

## Portable projects and discovery

Use list_templates(query?, category?) and list_animations(query?, category?) to discover relevant starting points. Category values are returned by the tools. Gallery films remain references, not editable presets.

Use export_project_bundle(projectId, filePath) to save a ZIP at a new absolute local path. The bundle includes saved brief, captions and internal tags; inspect them before sharing. It excludes credentials, history and original media. Do not overwrite an existing backup.

Use import_project_bundle(filePath) to validate and preview without saving, then previewOnly:false to import an independent copy. Read the resulting project and review it. Only bundle/schema version 1 is supported. Do not manually extract or execute archive content. For previewOnly:false, supply a stable requestId and reuse it with the same file contents after an ambiguous response. A new key creates an intentional additional copy. Without a key, reconcile the project list before retrying.

## Styling and automated review

Use editSlide.patch.appearance for headingScale/bodyScale (0.8–1.2) and align (left/center). Set appearance:null to reset. editSlide.patch.colors supports optional background/text/accent hex values; null resets to the project brand. Per-slide overrides survive applying another brand. Inspect every changed size; do not shrink text until it merely fits.

validate_project returns reviewVersion, projectId, revision and findings with slideId, severity, code, field, message and optional proposedCommands. It does not mutate the project or judge factual/editorial correctness. Demo/placeholder and FONT_FALLBACK notes need judgment, not automatic deletion. A fictional sample can retain its clearly identified demo brand. Missing primary-font characters may use device fallbacks; inspect the final output for missing glyphs or incorrect shaping. HIDDEN_MEDIA and overflow errors require repair before export. Apply selected suggestions using edit_project with the report's revision. Reread and rerun after any edit; do not reuse stale proposals. Reading-time estimates are for video and use whitespace words, not language-aware segmentation. Editable treatments can be applied through one batch while preserving durations and content. Snap Zoom emphasizes artwork (or the heading if no artwork exists). Headline Storm converges headline words, best with 2 to 8 words. Checklist Pop staggers list items in Checklist layout; other layouts reveal the body together. Choose by content rather than applying a dramatic effect everywhere. Validate reading time after motion changes. Full videos crossfade page boundaries for 0.2 seconds; individual clips retain complete final frames. Replay restarts the entrance, not a seamless ambient loop.

Checklist uses one nonblank body line per item. Comparison uses paragraphs separated by a blank line, with the first line of each paragraph as its label. Prefer exactly two options with matching criteria. Additional sections are never truncated; a review note asks you to restructure. CTA renders the body as a highlighted action panel. Layout switches preserve the full body and artwork; check fit after changing a layout. Headings and branding remain visible at time zero for basic motion.

If list_projects fails on an unreadable file, use inspect_library. It returns healthy compact projects and per-file recovery issues without changing anything. Preserve the original; import a known backup separately. Never repair unsupported schema versions by deleting fields or overwriting the source.

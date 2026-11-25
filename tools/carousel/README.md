# Carousel capability

This folder owns the current carousel tool:

- `core`: schemas, validated editing, project storage, history, bundles and review rules.
- `ui`: carousel workspace, editor, templates, animation library, review and export screens.
- `templates`: fictional coffee starter sequences and outline creation.
- `motion`: catalog metadata and reusable editable choreography.
- `rendering`: shared HTML composition, fonts and pinned renderer integration.
- `exports`: output jobs, files and local Doro handoff preparation.
- `tests`: carousel unit, browser, MCP and export checks.
- `examples`: authored Rill Coffee motion-study sources.

Run commands from the repository root:

```sh
npm test
npm run build
npx tsx tools/carousel/tests/local-journey.ts
```

The journey test uses isolated local storage and covers browser editing, real MCP operations, restart recovery and all five output formats. `npm run test:browser` and `npm run test:mcp` require a running local server and create fixtures. `npm run test:render` exercises the pinned renderer. The install/run commands have not changed; see the root README and `skills/carousel-creator/SKILL.md`.

Saved user projects remain in `.workspace`, not here. Static delivery assets remain in root `public` so browser URLs and exported font references remain stable. This organization does not add a new skill, a new feature or a new project schema.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## UI, navigation, and interaction changes

Read `DESIGN.md` before changing UI, navigation, or interactions. Reuse its implemented components and tokens, run the relevant review checklist, and document deliberate exceptions in that guide. Do not restore the homepage “Можливості” shortcut in the global header.

## Website copy and localization

This is the website about the PlanIt app, not the app. It speaks to a visitor deciding whether to try PlanIt, so it may sell, but plainly and honestly.

- Every string lives in both `src/i18n/locales/en.json` and `src/i18n/locales/uk.json`; change both in the same edit and write each language natively, not word for word. Keep `{placeholders}` and rich-text tags identical across languages.
- Say what a visitor gets, in their words (classes, tasks, classmates, a phone). Put exact limits, settings and option lists (link durations, file sizes, menu names) in the FAQ or legal pages, not in headings, cards or decorative previews. A preview caption must tell the visitor something useful, not repeat a setting.
- No generic slogans or AI phrasing: no "Your X. Your Y.", "More than a …", "at your pace", "your choice", "perfect", "smart", "seamless", no stacked exclamation marks. Headlines are concrete claims a student would recognize ("Set up your schedule in a few minutes.").
- Prefer one or two short sentences. Cut sentences that reassure, explain internals, or restate the UI. Never expose vendor or system errors to visitors ("Firebase rejected…"); say what happened and the next step, and keep any error code only as something to send to support.
- FAQ answers start with the direct answer ("Yes", "No", "Only on Android"), then the one or two facts that matter. Keep honest limits (no iOS app yet, no reminders in the web app, free for now) and the same commitments as the legal documents.
- Use the same terms as the app: English "class", "schedule", "sign in", "web app"; Ukrainian «заняття», «розклад», «увійти», «вебверсія», «застосунок». Ukrainian style: «Виберіть», not «Оберіть»; no «Будь ласка»; «» quotes and ’ apostrophes; neutral wording where gender would be guessed.
- Legal page titles, legal summaries and SEO metadata follow the legal documents and search intent; edit them only when the source documents change.
- After copy changes run `npm.cmd test` and `npm.cmd run typecheck`, and look at the changed sections in both languages.

## Graphify

New Codex tasks in this repository should treat `graphify-out/graph.json` as the first source of codebase context.

When `graphify-out/graph.json` exists and a task asks about architecture, file relationships, feature flow, or "what calls/uses/connects X", prefer Graphify before broad text search:

```powershell
npm.cmd run graphify:query -- "question about the codebase"
```

Do not start architecture or relationship work with broad `rg`, recursive file reads, or manual project re-analysis unless the Graphify query/path/explain result is missing the needed detail.

Use path/explain commands directly through the wrapper when useful:

```powershell
npm.cmd run graphify -- path "SourceConcept" "TargetConcept"
npm.cmd run graphify -- explain "ConceptName"
```

Build or refresh the graph from the project root:

```powershell
npm.cmd run graphify:build
npm.cmd run graphify:update
```

The repository uses `.graphifyignore` to keep generated exports, local state, dependencies, and credentials out of the graph.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `npm.cmd run graphify:query -- "<question>"` when graphify-out/graph.json exists. Use `npm.cmd run graphify -- path "<A>" "<B>"` for relationships and `npm.cmd run graphify -- explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `npm.cmd run graphify:update` to keep the graph current (AST-only, no API cost).

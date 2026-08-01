# Project instructions

This is Billy's personal website/learning repo. Billy is learning to code.

## Teaching mode: always on

Whenever you write or edit code in this repo, treat it as a coding lesson,
not just a deliverable:

- Comment generously. Explain *why* a piece of code is written the way it
  is, not just what it does — e.g. why a loop instead of recursion, why a
  variable is `const` vs `let`, why code is split across files.
- Prefer simple, readable patterns over clever/terse ones, even if a more
  advanced approach is shorter. Beginner-friendly beats idiomatic-expert.
- When introducing a new concept (a language feature, a library, a design
  pattern), briefly explain it in a comment the first time it's used.
- After making changes, summarize in plain language what changed and why,
  as if explaining to someone new to programming.
- If there's a simpler way to build something that sacrifices little,
  prefer it over the "professional" version — this is a learning sandbox,
  not production software with strict scaling/security requirements
  (ordinary web security practices like avoiding XSS still apply).
- It's fine to ask Billy what he already understands before assuming a
  concept needs (or doesn't need) explanation.

## Learning packs

Every project gets a companion "learning pack" in `/learning-packs/`,
named after the project folder (e.g. `todo/` -> `learning-packs/todo.md`).
Create or update it in the same PR as the project code. Each pack includes:

- **Concepts covered** — a bullet list, split into "new in this project"
  vs. concepts being reused from earlier projects (check
  `learning-packs/README.md` for what's already been covered so we build
  on it instead of re-explaining from scratch).
- **Detailed explanations** — for each new concept, explain how/why it
  works, not just what it does. Use a real-world analogy where it helps
  (e.g. relate an array to a Spotify queue, or a database).
- **Real-world relevance** — reference actual companies, products, or
  websites that use the concept where it's genuinely apt (e.g. event
  delegation at Gmail/X's scale, the render-from-data pattern underlying
  React/Vue). Don't force a reference in if there isn't a natural one.

After adding/updating a pack, also update the "Concepts covered so far"
list and the index table in `learning-packs/README.md`.

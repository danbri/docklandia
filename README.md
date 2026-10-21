# docklandia

Storage for bulky data of the londat / cwplans project (working name "Docklandia"; the owner may rename the project).
The app and small data stay in https://github.com/danbri/londat (site https://danbri.github.io/londat/). Large tile sets
and extracts go here, under `data/`, and are served by GitHub Pages at https://danbri.github.io/docklandia/ . That is the
same origin as the londat site (`https://danbri.github.io`), so the londat pages read these files with no CORS setup,
including HTTP range requests.

Layout: `data/<country>/<region-or-set>/...`, with `<country>` an ISO 3166-1 alpha-2 code in lower case (or an IETF
BCP 47 region subtag where that is clearer), e.g. `data/gb/london/`, `data/es/leon/`, `data/ba/sarajevo/`. Sets that cover
the world go in `data/world/`.

Rules (from londat's CLAUDE.md, which governs this repository too):
- Open licences only, as recorded in londat's data register (https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md);
  every set here has a README with each source, licence, extract date, SHA-256 and the operations that made it.
- Data, not visuals: tiles hold geometry, attributes and source imagery; nothing pre-rendered (architecture rule 6 in
  https://github.com/danbri/londat/blob/main/OKRS.md).
- No file over 100 MB; the Pages site of this repository has its own 1 GB limit.

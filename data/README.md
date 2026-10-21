# data/

One folder per country (ISO 3166-1 alpha-2, lower case), then one per set. Each set has its own README.md (provenance,
licences, hashes) written by the londat tool that built it. `world/` holds sets that cover the whole planet.

## Sets

| set | what | size | README |
|---|---|---|---|
| gb/uk-lite/ | the UK outside Greater London as a lite building set: 82,784 landmarks (own outline, id, card) plus the merged mass of 22.7 M buildings (one box a square); 3D Tiles 1.1, built by londat cwplans/tools/build-place-tiles.mjs --region uk-lite | 146 MB | [gb/uk-lite/README.md](gb/uk-lite/README.md) |

# data/

One folder per country (ISO 3166-1 alpha-2, lower case), then one per set. Each set has its own README.md (provenance,
licences, hashes) written by the londat tool that built it. `world/` holds sets that cover the whole planet.

## Sets

| set | what | size | README |
|---|---|---|---|
| gb/uk-lite/ | the UK outside Greater London as a lite building set: 82,784 landmarks (own outline, id, card); the other 22.7 M buildings each as its own box at its true position at the leaves (footprint area, orientation, height; compact layout cwplans-boxes-1), merged squares at the coarse levels; 3D Tiles 1.1, built by londat cwplans/tools/build-place-tiles.mjs --region uk-lite | 293 MB | [gb/uk-lite/README.md](gb/uk-lite/README.md) |

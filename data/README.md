# data/

One folder per country (ISO 3166-1 alpha-2, lower case), then one per set. Each set has its own README.md (provenance,
licences, hashes) written by the londat tool that built it. `world/` holds sets that cover the whole planet.

## Sets

| set | what | size | README |
|---|---|---|---|
| gb/uk-lite/ | the UK outside Greater London as a lite building set: 82,784 landmarks (own outline, id, card) plus the merged mass of 22.7 M buildings (one box a square); 3D Tiles 1.1, built by londat cwplans/tools/build-place-tiles.mjs --region uk-lite | 146 MB | [gb/uk-lite/README.md](gb/uk-lite/README.md) |
| de/berlin/ | Berlin-Mitte (Reichstag, Brandenburger Tor, Unter den Linden, Museumsinsel, Alexanderplatz) with the official LoD2 buildings of Berlin (dl-de/zero-2.0) and the DGM1 terrain in the core; Land Berlin as blocks (814,713 buildings, measured LoD2 heights for 441,635); 35 km surroundings; 3D Tiles 1.1, built by londat cwplans/tools/build-place-tiles.mjs --region berlin | 192 MB | [de/berlin/README.md](de/berlin/README.md) |
| de/stuttgart/ | Stuttgart-Mitte (Schlossplatz, Königstraße, Hauptbahnhof, the valley sides up to the Fernsehturm) with terrain; Stuttgart as blocks (204,859 buildings); 35 km surroundings (Neckar); --region stuttgart | 66 MB | [de/stuttgart/README.md](de/stuttgart/README.md) |
| de/dagstuhl/ | Schloss Dagstuhl (Leibniz-Zentrum für Informatik) with Wadern, Dagstuhl, Lockweiler and Wadrill in the Hunsrück hills; the municipality of Wadern as blocks (31,902 buildings); 35 km surroundings; --region dagstuhl | 42 MB | [de/dagstuhl/README.md](de/dagstuhl/README.md) |

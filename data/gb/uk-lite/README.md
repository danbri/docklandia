# United Kingdom (lite buildings): a lite building set on the globe (3D Tiles 1.1)

Made by [cwplans/tools/build-place-tiles.mjs](https://github.com/danbri/londat/blob/main/cwplans/tools/build-place-tiles.mjs) (with [place-lite.mjs](https://github.com/danbri/londat/blob/main/cwplans/tools/place-lite.mjs) and [place-blocks.mjs](https://github.com/danbri/londat/blob/main/cwplans/tools/place-blocks.mjs)) of https://github.com/danbri/londat for the region config [docklands/geo/regions/uk-lite.js](https://github.com/danbri/londat/blob/main/docklands/geo/regions/uk-lite.js); drawn by the globe of the Three.js port ([docklands/globe/places.js](https://github.com/danbri/londat/blob/main/docklands/globe/places.js)). Served from https://danbri.github.io/docklandia/data/gb/uk-lite/
This README is generated from `provenance/log.json`, `features.json` and londat's [cwplans/data-register.json](https://github.com/danbri/londat/blob/main/cwplans/data-register.json) by `node cwplans/tools/build-place-tiles.mjs readme --region uk-lite --out <this folder>` (also at the end of each build). Do not edit it by hand.

Owner, 2026-10-22, about buildings for the whole UK: "can we pick a lite subset or slice somehow? Key landmarks, modest resolution?"

## What it is

- Scope: the United Kingdom outside Greater London. Greater London is its own place (kind "blocks", every building; its README: https://github.com/danbri/londat/blob/main/cwplans/docklands/data/places/london/README.md ): a building whose centroid is in the ONS region E12000007 polygon of the UK skeleton is drawn by London only, the same polygon and the same centroid rule as London's build, so no building is drawn twice. Every other building belongs to the first part (English regions, then Wales, Scotland, Northern Ireland; ONS BGC polygons of the UK skeleton) whose polygon holds its centroid; a building outside every polygon (the generalised coast; the edges of two ONS products at the Welsh and Scottish borders) goes to the nearest part within 250 m, never inside the Republic of Ireland (Natural Earth).
- Three ways a building is drawn: (a) **landmarks**, each with its outline (simplified at 1.5 m), its own id (`_FEATURE_ID_0` = row of features.json) and a card, and as an oriented box with the same card at the coarse levels where it is tall or big enough; (b) at the leaves, **every other building** (OpenStreetMap and Microsoft footprints, 20 m2 or more) as **its own box at its true position** (centroid): its footprint area, the orientation and the long / short ratio of its minimum rotated rectangle, its height; no outline and no id (a tap gives its card: footprint source, height and its source); (c) at the coarse levels the **far forms** (place-lite-tiles 5, issue #13, owner 2026-10-23: "towns from 20 km read as towns, not tiles"): real buildings and **street blocks** at their true positions, no squares. Adjacent buildings of one leaf cell (oriented boxes within 5 m, heights within max(3 m, 35 %)) are one block: one oriented box at their grain, its footprint the sum of theirs, its height their area-weighted mean (cut in two while they fill less than 70 % of it); a level draws the blocks whose seen size sqrt(area) x max(sqrt(area), height) is at least its min_m2, about one device pixel squared at the far end of the level's range on a phone; smaller ones are left to the nearer levels (counted). Landmarks join as their own boxes.
- Leaves (level 11, about 9.8 x 5.6 km at 55 N; drawn within about 5 km of the eye on a phone screen): one box a building. Coarse levels: level 7 blocks of seen size 11,400 m2 or more (landmarks of 150 m or 150,000 m2 and more as boxes; geometricError 2560 m); level 8 blocks of seen size 2,850 m2 or more (landmarks of 90 m or 60,000 m2 and more as boxes; geometricError 1280 m); level 9 blocks of seen size 712 m2 or more (landmarks of 60 m or 25,000 m2 and more as boxes; geometricError 640 m); level 10 blocks of seen size 178 m2 or more (landmarks of 40 m or 10,000 m2 and more as boxes; geometricError 160 m). REPLACE refinement, quadtree of the cells with buildings; levels 9 to 11 are in external tile sets (`tilesets/<level 8 cell>.json`), so the root tileset.json stays small and the whole UK loads from far (the reader loads the place within 1200 km of its centre).
- Compact boxes (layout `cwplans-boxes-1`, glb `extras.blocks.compact`: one buffer view of 8 bytes a box and one of the ground grid): int16 east and north in the tile frame, one byte each for the footprint area (log scale), the height (0.25 m steps to 50 m, then 5 m), the angle of the long side and the flags (aspect, footprint class, height source). The buildings' boxes and the merged squares use it; the landmarks' outlines and boxes are plain glTF (KHR_mesh_quantization, EXT_mesh_gpu_instancing). The reader (docklands/globe/places.js) turns the compact boxes into instances of the unit box.
- No ground of its own: the blocks stand on the globe's ground (world-base heights, Copernicus GLO-90, where it has tiles, else the globe's world terrain texture) plus the EGM96 geoid, sampled on a 17 x 17 grid a tile; bases 8 m deep. Tiles hold geometry and attributes only, no texture and no baked light (Architecture rule 6).

## The landmark rule

A building whose outline comes from OpenStreetMap (via Overture) is a landmark when one of these holds (checked in this order; the card says which):

1. it has an OSM `wikidata` or `wikipedia` tag (an encyclopaedia record);
2. it is of a notable kind: OSM `building` (or Overture class) cathedral, castle, palace, stadium, grandstand, tower, lighthouse, windmill; `historic` castle, palace, fort, tower, monastery, abbey, city_gate; `man_made` tower, lighthouse, windmill, water_tower; `leisure` stadium;
3. it has a name and is 25 m or taller by a measured height (OSM height or levels, Microsoft ML or another open Overture source; not the GHSL cell mean nor a default), or its footprint is 3,000 m2 or more.

The OSM tags of rules 1 and 2 come from one SPARQL query of the QLever OSM endpoint (planet of 2026-09-21; the buildings that the UK relation 62149 contains), joined to the Overture record by its OSM id. A landmark by the rule whose outline is not in the slim answer (geometry is fetched only for named, tall, big or notable-class records) is merged into the mass and counted. Microsoft footprints have no names or tags, so they are never landmarks. Buildings under 20 m2 are left out.

Landmarks: 83,428. By reason: wikidata 63,193, named-big 15,148, kind 1,384, named-tall 1,513, man_made 1,067, historic 292, wikipedia 151, leisure 36.

## Landmark heights (towers and spires)

Owner, 2026-10-22, to "should I improve the landmark heights next, with OSM spire and tower parts or the heights in Wikidata?": "Yes do that". Operation `place-lite-landmark-heights` ([place-lite-heights.mjs](https://github.com/danbri/londat/blob/main/cwplans/tools/place-lite-heights.mjs)). The body of a landmark (its own outline) keeps its height (often a Microsoft roof height or the GHSL cell mean: fault F55). Above it:

1. **OSM building parts** (`building:part` with a `height`, via the Overture building_part theme, joined to the landmark by its Overture building id): every part whose top is at least max(3 m, 15 % of the body) above the body is drawn as its own block with the landmark's id and card, at most 64 a landmark. **By its shape** (place-lite-landmark-heights 2, 2026-10-23, issue #14: before, every part was a straight column from the ground): its walls start at its `min_height` when the body or a part already standing under it (boxes meeting, top within 1 m) holds it up, else at the ground; a part with a pointed roof (`roof:shape` pyramidal, cone, conical, spire; `building:part=spire`) ends in a pyramid or cone to one apex over its centroid (an octagonal outline gives an octagonal spire), a dome or onion roof in that cap (the profiles of the landmark sets, [roof-caps.mjs](https://github.com/danbri/londat/blob/main/cwplans/tools/roof-caps.mjs)); the cap is `roof:height` high, the whole part for `building:part=spire`, else min(0.25 x its height, 8 m). The OSM `roof:shape` and `building:part` of the parts come from one QLever query (Overture's schema has no cone and no part kind) and win over Overture's `roof_shape`.
2. **Wikidata height** (P2048 of the landmark's OSM `wikidata` item; CC0; statements with an end time or of deprecated rank left out, preferred statements first, then the greatest; feet converted): when it is at least max(3 m, 15 %) above the highest top so far and at most 330 m, a spire is drawn on the tallest part (a square pyramid of 0.35 x the square root of its area, from the part's top), else a square tower at the landmark's centroid (side 0.2 x the square root of the footprint, 4 to 15 m). The tower's place is a rule, not a survey.
3. The card gives the body height and the highest point with its source; describeView names the tallest landmark by its highest point.

Counts: landmarks 82,784; with building parts (any height) 695; with parts above the body (drawn) 490; parts drawn 2,700; parts drawn with a pointed cap (spire or pyramid) 445; parts drawn with a dome 118; parts drawn with an onion 16; parts drawn from their min_height (held up) 599; with a Wikidata height 197; Wikidata spire on a part 2; Wikidata tower at the centroid 88; Wikidata height not used (not above the top, or over the limit) 107.

Highest point by source: ms 41,980, ghsl 28,040, osm-levels 9,882, osm-height 1,462, default 755, osm-part 488, wikidata 90, default-small 87.

Known landmarks against a published height (within 10 % is the target of issue #14):

| landmark | highest point drawn | its source | reference | difference |
|---|---|---|---|---|
| Salisbury Cathedral | 123 m | osm-part | 123 m (spire, Wikidata P2048) | +0 % |
| Lincoln Cathedral | 80 m | osm-part | 83 m (central tower, Wikidata P2048 (preferred)) | -3.6 % |
| York Minster | 63 m | osm-part | 72 m (central tower, published figure; no Wikidata P2048, and OSM maps the central tower part at 54 m with a flat roof: the 63 m drawn are the west towers' pinnacles (an OSM fault, listed, not patched)) | -12.5 % |
| Durham Cathedral | 66 m | osm-part | 66 m (central tower, Wikidata P2048) | +0 % |
| Liverpool Cathedral | 100 m | osm-part | 101 m (tower) | -1 % |
| Blackpool Tower | 158 m | osm-height | 158 m (tower) | +0 % |
| Angel of the North | 20 m | wikidata | 20 m (sculpture, Wikidata P2048) | +0 % |

## Structures that are not OSM buildings

Operation `place-lite-structures` (issue #14; [place-lite-heights.mjs](https://github.com/danbri/londat/blob/main/cwplans/tools/place-lite-heights.mjs) `structureRows`): an OSM element that is not tagged `building` and is of a listed kind (`man_made` tower, chimney, obelisk, lighthouse, mast, monument; `historic` monument, memorial, castle; `tourism` artwork) is a landmark when it has a `wikidata` or `wikipedia` tag, or a name and an OSM height of 25 m or more. Its height is the OSM `height`, else the Wikidata P2048 of its item; it is drawn when that is 10 m or more: its OSM outline (an area), else a shape at its node by kind (a square or a 12-sided body, half width a share of the height; an obelisk ends in a point). A castle area that is not a building (`historic=castle` with `wikidata`, such as Edinburgh Castle) is a **site**: a row for search and the card, not drawn (its buildings are drawn as themselves). One QLever query (positions as WKT) and one Wikidata query for the heights; each structure belongs to the part whose polygon holds it (London's are left to London).

Counts: a landmark by the rule but no height (OSM or Wikidata): not drawn 3,581; castle sites (search and card, not drawn) 319; height from osm-height 253; not a landmark by the rule 144; height from wikidata 109; under 10 m: not drawn 105; drawn: man_made=lighthouse 104; drawn: man_made=tower 100; drawn: man_made=mast 98; outside every UK polygon 25; drawn: man_made=chimney 20; drawn: tourism=artwork 13; in London (left to that place) 12; drawn: historic=monument 11; drawn: historic=memorial 9; no geometry 8; drawn: man_made=obelisk 5; drawn: man_made=monument 1; drawn: man_made=column 1. Rows: 644 (of them sites 315).

## Views (live after the merge)

- The UK from 500 km: https://danbri.github.io/londat/docklands/?ll=54.5,-3.0,500000&ht=0,0
- Manchester from 20 km: https://danbri.github.io/londat/docklands/?ll=53.4794,-2.2453,20000&ht=0,45
- Edinburgh from 20 km: https://danbri.github.io/londat/docklands/?ll=55.9533,-3.1883,20000&ht=0,45
- Durham Cathedral (700 m): https://danbri.github.io/londat/docklands/?ll=54.7735,-1.5765,700&ht=200,60
- York Minster (700 m): https://danbri.github.io/londat/docklands/?ll=53.9623,-1.0819,700&ht=200,60
- York from 1.1 km (one box a building): https://danbri.github.io/londat/docklands/?ll=53.9620,-1.0793,1100&ht=0,60
- Salisbury Cathedral (700 m; spire 123 m from OSM parts, drawn as a spire since 2026-10-23): https://danbri.github.io/londat/docklands/?ll=51.0651,-1.7973,700&ht=200,60
- Lincoln Cathedral (700 m): https://danbri.github.io/londat/docklands/?ll=53.2343,-0.5361,700&ht=200,60
- The Angel of the North (400 m; a structure, not an OSM building): https://danbri.github.io/londat/docklands/?ll=54.9141,-1.5897,400&ht=200,70
- Manchester from 50 km (far forms): https://danbri.github.io/londat/docklands/?ll=53.4794,-2.2453,50000&ht=0,45

## Files and sizes

| path | what | files | bytes | SHA-256 |
|---|---|---|---|---|
| tileset.json | the root: levels 7 and 8, ENU transforms relative to the parent, region bounding volumes, geometric errors; the level-8 tiles refer to their external tile sets | 1 | 97348 | `5f2e29078c6f8ad59f601de96520727c31b9cb02570f36ab76d3c4bb1e0a57e9` |
| tilesets/ | one external tileset per level-8 cell (levels 9 to 11; content URIs relative to it) | 133 | 2787863 | `a565a3ca7b559202d8e4268dacf09d3703c885ec5210058308ba3f26c82b1729` (list of names and SHA-256) |
| tiles/ | glTF 2.0 tiles: landmark outlines with COLOR_0 and _FEATURE_ID_0 (EXT_mesh_features), landmark boxes as EXT_mesh_gpu_instancing instances of one unit box, KHR_mesh_quantization; the buildings' boxes (leaves) and the merged squares (coarse levels) in the compact layout cwplans-boxes-1 (extras.blocks.compact); glb extras.blocks: class, height (dm), height source, landmark row (boxes.f), landmark rows drawn as outlines (named), buildings the merged squares stand for | 7055 | 304319540 | `4cde279f6fcfcea56a15f44d03a9de105961072a299563db2b8f33f026d93eb3` (list of names and SHA-256) |
| features/ | the landmarks, one shard a part (rows offset .. offset + count - 1 of the tiles' feature ids): OSM id, name, kind, position, height and its source, leaf tile, ground, Wikidata, the rule that made it a landmark, Wikipedia; read by the page for the parts in view | 11 | 10954315 | `e5954d95c3e5f01bd28fdd8971fe8528f04d0fc76e60dd2b8cc118867bc431b6` (list of names and SHA-256) |
| features.json | the text and machine interface of the set: the parts and their shards, the landmark rule, sizes by level and class, the credit | 1 | 9727 | `493358320c8c7608235394e095a1ca9c9deee0c76abc4ba1e58931c1006d37a1` |
| names.json | the named landmarks for search (name, position, row); read on the first search | 1 | 2792804 | `95ae175c4a3e627cec6516961feee4bc1c43d7147b34cb7efec4ad0ad3262796` |
| provenance/log.json | fetch records and dataflow activities (inputs and outputs by SHA-256), counts per part | 1 | 1419119 | `1313d6d1d5f4b5ead716a32d0204c2169b915a4614dfb6cbd7f5a4bca3a0b62f` |

Total 322.38 MB (README.md not counted). Tiles by class (attributed: landmark outline vertices and indices, and 36 bytes for each landmark box; the rest is the mass): landmarks 57.49 MB, other buildings (their own boxes at the leaves, far blocks at the coarse levels) 246.83 MB.

### By level

| level | tiles | MB | triangles | landmark outlines | landmark boxes | buildings as their own boxes | far blocks (buildings they stand for) |
|---|---|---|---|---|---|---|---|
| 7 | 47 | 0.21 | 67,292 | 0 | 94 | 0 | 6,559 (10,406) |
| 8 | 133 | 1.10 | 649,020 | 0 | 472 | 0 | 63,687 (111,381) |
| 9 | 415 | 6.12 | 5,112,293 | 0 | 1,673 | 0 | 506,577 (1,159,548) |
| 10 | 1,429 | 43.63 | 46,482,769 | 0 | 4,701 | 0 | 4,635,327 (9,044,199) |
| 11 | 5,031 | 253.27 | 228,978,705 | 85,902 | 0 | 22,661,675 | 0 (0) |

### By part (region)

Tile bytes are shared out by the built area of each part under a tile (a tile on a border counts in both by share).

| part | code | records read | buildings drawn: landmarks | in the mass (of them Microsoft) | heights: OSM, Microsoft, other Overture, GHSL, default | tile MB (landmarks) |
|---|---|---|---|---|---|---|
| North East | E12000001 | 1,025,031 | 3,828 | 909,454 (301,552) | 27,755, 372,312, 0, 496,196, 17,019 | 12.3 (2.4) |
| North West | E12000002 | 3,207,185 | 6,992 | 2,467,964 (835,946) | 222,802, 1,085,052, 0, 1,124,929, 42,173 | 31.2 (5.4) |
| Yorkshire and The Humber | E12000003 | 3,463,544 | 7,104 | 2,100,499 (638,076) | 89,332, 821,670, 0, 1,156,091, 40,510 | 26.8 (5.1) |
| East Midlands | E12000004 | 4,798,223 | 5,717 | 1,993,225 (849,359) | 64,252, 1,125,344, 0, 770,834, 38,512 | 25.1 (4.3) |
| West Midlands | E12000005 | 3,568,972 | 6,349 | 2,021,963 (569,949) | 175,531, 1,098,182, 0, 717,318, 37,281 | 26.2 (5.0) |
| East of England | E12000006 | 4,348,373 | 9,981 | 2,526,335 (806,934) | 101,126, 1,341,594, 0, 1,044,947, 48,649 | 33.3 (6.9) |
| South East | E12000008 | 7,241,755 | 13,041 | 3,222,655 (979,916) | 221,161, 1,750,679, 0, 1,198,523, 65,333 | 42.9 (9.1) |
| South West | E12000009 | 4,048,105 | 14,763 | 2,562,293 (742,829) | 360,885, 1,222,212, 0, 946,209, 47,750 | 36.0 (8.6) |
| Wales | W92000004 | 2,322,280 | 5,161 | 1,436,795 (650,721) | 45,140, 694,700, 0, 677,680, 24,436 | 19.6 (3.4) |
| Scotland | S92000003 | 4,063,687 | 8,909 | 2,261,777 (339,096) | 222,634, 963,540, 0, 1,009,152, 75,360 | 37.0 (6.3) |
| Northern Ireland | N92000002 | 1,511,014 | 939 | 1,158,715 (266,213) | 26,102, 330,952, 0, 740,246, 62,354 | 13.9 (1.1) |

What each part left out or took by a rule (counts of place-lite-select):

- North East: records of this part 953,855; under 20 m2 (left out) 40,573; belongs to another part 71,161; outside every UK polygon, kept by the coast rule (within 250 m) 874; outside every UK polygon (left out) 15
- North West: belongs to another part 591,695; records of this part 2,615,452; under 20 m2 (left out) 140,496; outside every UK polygon, kept by the coast rule (within 250 m) 998; outside every UK polygon (left out) 38
- Yorkshire and The Humber: records of this part 2,227,414; belongs to another part 1,236,125; under 20 m2 (left out) 119,811; outside every UK polygon, kept by the coast rule (within 250 m) 1,668; outside every UK polygon (left out) 5
- East Midlands: records of this part 2,173,775; belongs to another part 2,624,446; under 20 m2 (left out) 174,833; outside every UK polygon, kept by the coast rule (within 250 m) 256; outside every UK polygon (left out) 2
- West Midlands: belongs to another part 1,443,861; records of this part 2,125,111; under 20 m2 (left out) 96,799; outside every UK polygon, kept by the coast rule (within 250 m) 15
- East of England: records of this part 2,712,747; in London (drawn by that place) 1,080,103; belongs to another part 554,091; under 20 m2 (left out) 176,431; outside every UK polygon, kept by the coast rule (within 250 m) 2,859; outside every UK polygon (left out) 1,432
- South East: belongs to another part 2,204,432; records of this part 3,468,048; in London (drawn by that place) 1,567,754; under 20 m2 (left out) 232,352; outside every UK polygon, kept by the coast rule (within 250 m) 3,690; outside every UK polygon (left out) 1,521
- South West: belongs to another part 1,283,642; records of this part 2,764,286; under 20 m2 (left out) 187,230; outside every UK polygon, kept by the coast rule (within 250 m) 4,528; outside every UK polygon (left out) 177
- Wales: records of this part 1,543,842; belongs to another part 778,370; outside every UK polygon, kept by the coast rule (within 250 m) 2,042; under 20 m2 (left out) 101,886; outside every UK polygon (left out) 68
- Scotland: records of this part 2,535,784; belongs to another part 1,354,508; under 20 m2 (left out) 265,098; outside every UK polygon (left out) 173,395; outside every UK polygon, kept by the coast rule (within 250 m) 9,196
- Northern Ireland: records of this part 1,248,169; under 20 m2 (left out) 88,515; outside every UK polygon (left out) 262,622; outside every UK polygon, kept by the coast rule (within 250 m) 4,232; belongs to another part 223

## Sources

### osm-landmark-tags: OpenStreetMap

- Register source: `osm` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© OpenStreetMap contributors"
- Fetched: 2026-10-23T10:37:02.741Z (OpenStreetMap, PBF from https://planet.openstreetmap.org/pbf/planet-260921.osm.pbf, converted to RDF TTL and enhanced by DE-9IM triples using osm2rdf)
- Request: `https://qlever.dev/api/osm-planet` — SPARQL POST (text/tab-separated-values): PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:> PREFIX osmrel: <https://www.openstreetmap.org/relation/> PREFIX ogc: <http://www.opengis.net/rdf#> SELECT ?w ?b ?wd ?wp ?hist ?mm ?leis ?name WHERE { osmrel:62149 ogc:sfContains ?w . ?w osmkey:building ?b . OPTIONAL { ?w osmkey:wikidata ?wd } OPTIONAL { ?w osmkey:wikipedia ?wp } OPTIONAL { ?w osmkey:historic ?hist } OPTIONAL { ?w osmkey:man_made ?mm } OPTIONAL { ?w osmkey:leisure ?leis } OPTIONAL { ?w osmkey:name ?name } FILTER(BOUND(?wd) \|\| BOUND(?wp) \|\| ?b IN ("cathedral", "castle", "palace", "stadium", "grandstand", "tower", "lighthouse", "windmill") \|\| ?hist IN ("castle", "palace", "fort", "tower", "monastery", "abbey", "city_gate") \|\| ?mm IN ("tower", "lighthouse", "windmill", "water_tower") \|\| ?leis IN ("stadium")) }
- As fetched: 6723437 bytes, SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- Stored for the build: `data/raw/places/uk-lite/osm-landmark-tags.tsv`, 6723437 bytes, SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a` — NOT committed (londat's raw folder, git-ignored); 76,131 rows

### heights-world-ghsl: GHS-BUILT-H R2023A: average net building height (ANBH), epoch 2018, 3 arc-second grid (EPSG:4326), 10 x 10 degree tiles (Global Human Settlement Layer)

- Register source: `ghsl-built-h` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: CC BY 4.0 (Commission reuse policy, Decision 2011/833/EU; copyright.txt in the GHS_BUILT_H_GLOBE_R2023A folder: "(c) European Union, 1995-2026") (https://creativecommons.org/licenses/by/4.0/)
- Credit (exact text): "GHS-BUILT-H R2023A © European Union, 1995-2026, JRC (Pesaresi M., Politis P. (2023): GHS-BUILT-H R2023A - GHS building height, derived from AW3D30, SRTM30, and Sentinel2 composite (2018). European Commission, Joint Research Centre, doi:10.2905/85005901-3A49-48DD-9D19-6261354F56FE)"
- Fetched: 2026-10-23T10:37:18.094Z
- Request: `https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_BUILT_H_GLOBE_R2023A/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss/V1-0/tiles/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss_V1_0_R3_C18.zip` ; `https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_BUILT_H_GLOBE_R2023A/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss/V1-0/tiles/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss_V1_0_R4_C18.zip` ; `https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_BUILT_H_GLOBE_R2023A/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss/V1-0/tiles/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss_V1_0_R4_C19.zip`
- As fetched: 1587471 bytes, SHA-256 `8bb60cd4bc6fe98a7381326f97a48379838d2ef19ca171abd556216ecda8a35d` (https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_BUILT_H_GLOBE_R2023A/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss/V1-0/tiles/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss_V1_0_R3_C18.zip)
- As fetched: 47339768 bytes, SHA-256 `e4babc01aa6faa9ea8f7efad57fce27e5cf699b0104723d9f70e4e6db27dc7f3` (https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_BUILT_H_GLOBE_R2023A/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss/V1-0/tiles/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss_V1_0_R4_C18.zip)
- As fetched: 66387983 bytes, SHA-256 `f3d948fabbd7ca229f3898e5eaa106484c6e32eb4c4a966e1333b49f9cd2c226` (https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/GHSL/GHS_BUILT_H_GLOBE_R2023A/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss/V1-0/tiles/GHS_BUILT_H_ANBH_E2018_GLOBE_R2023A_4326_3ss_V1_0_R4_C19.zip)
- Stored for the build: `data/raw/places/uk-lite/ghsl-tiles.json`, 1006 bytes, SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f` — NOT committed (londat's raw folder, git-ignored)

### overture-building-parts: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T10:37:32.876Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building_part/ (bbox -8.7,49.85,1.8,60.9; files part-00000-7e1e3f13-ca48-5851-a16f-b54315e6becc-c000.zstd.parquet part-00001-3e3609de-c235-5a96-9049-7f562d56b2ee-c000.zstd.parquet part-00002-f166bab0-4dbb-5bf4-8931-37611da5b0ad-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 3 files of the release, building parts (OSM building:part via Overture) in the UK box with: height IS NOT NULL; columns building_id, height, min_height, roof_shape, roof_height, num_floors; geometry; rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-building-parts-2026-09-23.1.ndjson`, 18201356 bytes, SHA-256 `5fc23d4beb97b4e16f64bf1230b4c24094f54b77b5c1c821e5aaee2d8d96dc6c` — NOT committed (londat's raw folder, git-ignored); 26,690 records

### wikidata-heights: Wikidata (SPARQL; QLever for the registry)

- Register source: `wikidata` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: CC0 1.0
- Credit (exact text): ""
- Fetched: 2026-10-23T10:38:00.397Z
- Request: `https://qlever.dev/api/wikidata` — SPARQL POST (text/tab-separated-values), 14 requests of up to 5000 items: the P2048 (height) statements (value, unit, rank, end time) of the 69053 wikidata items of the landmark tags
- As fetched: 4018 bytes, SHA-256 `968ff7fc2cb3a3090ebe924660015fff6d0d5abf57e980fa78e7f6355e15a8f9` (undefined)
- As fetched: 5675 bytes, SHA-256 `4ba86beb69aab2a6b280a17f5ecbfb9135f0e729d57bade750ce4c6203d2da68` (undefined)
- As fetched: 542 bytes, SHA-256 `0699f593e36fb379414ebe40554bdae81924f1537a70f168177f5b1c86653fb9` (undefined)
- As fetched: 926 bytes, SHA-256 `0f5ee2f5a3acfbf29a3ed11b33ac4332c4eaa35fc8d57df242d47dd2da882334` (undefined)
- As fetched: 6025 bytes, SHA-256 `e1fc706ef4ee10198681532b0b4ec8c0f2e56c95d37ba19e6a80297823faa7ab` (undefined)
- As fetched: 541 bytes, SHA-256 `5003975f1ac1482d65e9e5798fca37812106d010acaf3a05363c1f275b80c090` (undefined)
- As fetched: 159 bytes, SHA-256 `141a04348f47a056941a65ce3845c773c4cd764a2a6c02c6ef15185a42204356` (undefined)
- As fetched: 287 bytes, SHA-256 `f20a763fbf7899d49b7395c75e4fdf8e8f74e3006015a5556dddd277d839bf13` (undefined)
- As fetched: 287 bytes, SHA-256 `ccefb4aa18829b9ca8af1da0b4a06601ae48a1e06fb01ceb6bc48cb17218356c` (undefined)
- As fetched: 415 bytes, SHA-256 `8873e8aef8b42b8947b7929556b0a4f68fa80d43117b5196c1a21117e9397f5c` (undefined)
- As fetched: 6940 bytes, SHA-256 `3a3143dfa32145177a40805df2e3f6d5f99e03a2f33bad4f2e20b96afbbb4bf3` (undefined)
- As fetched: 2703 bytes, SHA-256 `d0681bd24b36df733b332a72b07848f426cc7e48e697b1959f8d24f7979d673b` (undefined)
- As fetched: 11283 bytes, SHA-256 `635f1332504b1f36ad0c873c5d9e9da2f8b482576a013d082f511ddd4d8390e0` (undefined)
- As fetched: 1937 bytes, SHA-256 `14054b5a21d9f95c792e443f3a8b1e135f241ee2776000b72c87f6ced93913c1` (undefined)
- Stored for the build: `data/raw/places/uk-lite/wikidata-heights.tsv`, 41335 bytes, SHA-256 `e184b6056752ddbf0be048672f6e83cc8d0dbb3ea56b0c02154febd6d8acfb4e` — NOT committed (londat's raw folder, git-ignored); 323 rows

### overture-buildings-E12000001: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T10:40:50.513Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -2.69,54.45,-0.78,55.82; files part-00119-81622b81-48e8-52c6-9401-fee68c213e71-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000001-2026-09-23.1.ndjson`, 325601489 bytes, SHA-256 `f9efc5aaa735b83d5d4ce74b11cde781a415984afc38b76f8870bdd47d61194e` — NOT committed (londat's raw folder, git-ignored); 1,025,031 records

### overture-buildings-E12000002: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T10:45:35.513Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -3.64,52.94,-1.9,55.19; files part-00118-94aca8a5-1f4c-5728-96b6-8ae9c53f2db0-c000.zstd.parquet part-00119-81622b81-48e8-52c6-9401-fee68c213e71-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000002-2026-09-23.1.ndjson`, 1014738050 bytes, SHA-256 `0d95dbf52743dfd648a507b9a8cc687259c17475b3f2292298c952c13f140cee` — NOT committed (londat's raw folder, git-ignored); 3,207,185 records

### overture-buildings-E12000003: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T10:50:59.793Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -2.57,53.3,0.15,54.56; files part-00119-81622b81-48e8-52c6-9401-fee68c213e71-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000003-2026-09-23.1.ndjson`, 1094619834 bytes, SHA-256 `74e3e3806b67ae700f707ebd2ec127c75f08414fa906a6f7d4a707219ea169d4` — NOT committed (londat's raw folder, git-ignored); 3,463,544 records

### overture-buildings-E12000004: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T10:57:24.593Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -2.04,51.97,0.36,53.62; files part-00126-8f48508e-8015-5699-a61b-0cb738bc4755-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000004-2026-09-23.1.ndjson`, 1533654434 bytes, SHA-256 `4204e9ec7abb34b16f62edc10c1cf433633acc36ce43d0a5c184d124e329a708` — NOT committed (londat's raw folder, git-ignored); 4,798,223 records

### overture-buildings-E12000005: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:03:15.305Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -3.24,51.82,-1.17,53.23; files part-00118-94aca8a5-1f4c-5728-96b6-8ae9c53f2db0-c000.zstd.parquet part-00126-8f48508e-8015-5699-a61b-0cb738bc4755-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000005-2026-09-23.1.ndjson`, 1159363368 bytes, SHA-256 `b7ba6cc5ed9b3781081972fe75378f1cc558c3f1c8f2b0da61ec97e9548a91ac` — NOT committed (londat's raw folder, git-ignored); 3,568,972 records

### overture-buildings-E12000006: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:09:31.753Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -0.75,51.45,1.77,52.99; files part-00124-5e200299-5dc8-5a43-bb1e-0a73aba3373f-c000.zstd.parquet part-00125-dd983f4b-21a7-5215-910c-4de2f4a24e2b-c000.zstd.parquet part-00126-8f48508e-8015-5699-a61b-0cb738bc4755-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet part-00232-4ab24746-b77e-5c74-8f06-69e1046691be-c000.zstd.parquet part-00236-2815f93e-41da-5b93-ac91-ca6b264bad4a-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000006-2026-09-23.1.ndjson`, 1388927775 bytes, SHA-256 `cfd832456487f497cbf2ae2dcf56ce0b87c3e496595f67e41a8a475dd5677d32` — NOT committed (londat's raw folder, git-ignored); 4,348,373 records

### overture-buildings-E12000008: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:18:14.465Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -1.96,50.57,1.45,52.2; files part-00124-5e200299-5dc8-5a43-bb1e-0a73aba3373f-c000.zstd.parquet part-00125-dd983f4b-21a7-5215-910c-4de2f4a24e2b-c000.zstd.parquet part-00126-8f48508e-8015-5699-a61b-0cb738bc4755-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000008-2026-09-23.1.ndjson`, 2334425588 bytes, SHA-256 `5245ce6b3b83e1317fe21e5e5c5884823bfc15a4b029c4ae68c31a5d2a8f4dc9` — NOT committed (londat's raw folder, git-ignored); 7,241,755 records

### overture-buildings-E12000009: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:24:44.993Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -6.38,49.88,-1.48,52.12; files part-00115-e2edec8c-c8d8-5b57-ab5a-e7aa714b6e6a-c000.zstd.parquet part-00117-aa29aaa7-de27-5bd7-a734-20716d499fad-c000.zstd.parquet part-00118-94aca8a5-1f4c-5728-96b6-8ae9c53f2db0-c000.zstd.parquet part-00124-5e200299-5dc8-5a43-bb1e-0a73aba3373f-c000.zstd.parquet part-00126-8f48508e-8015-5699-a61b-0cb738bc4755-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-E12000009-2026-09-23.1.ndjson`, 1293510333 bytes, SHA-256 `4a7a1ea8535520e8128585bb65ef95c333a570cdabd47eb072f9264b3cef4ed1` — NOT committed (londat's raw folder, git-ignored); 4,048,105 records

### overture-buildings-W92000004: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:29:27.349Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -5.36,51.38,-2.65,53.44; files part-00118-94aca8a5-1f4c-5728-96b6-8ae9c53f2db0-c000.zstd.parquet part-00119-81622b81-48e8-52c6-9401-fee68c213e71-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-W92000004-2026-09-23.1.ndjson`, 730260806 bytes, SHA-256 `550fe2745ffd2872f0d3a297d556b4a1b03181dc1ab237d174c988104ce744ef` — NOT committed (londat's raw folder, git-ignored); 2,322,280 records

### overture-buildings-S92000003: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:35:18.013Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -8.65,54.63,-0.74,60.85; files part-00113-2d49482a-065f-52da-9587-cfea68852c87-c000.zstd.parquet part-00115-e2edec8c-c8d8-5b57-ab5a-e7aa714b6e6a-c000.zstd.parquet part-00119-81622b81-48e8-52c6-9401-fee68c213e71-c000.zstd.parquet part-00127-bc8e68d6-59a7-5f70-86c5-46c3903f97bc-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-S92000003-2026-09-23.1.ndjson`, 1325700058 bytes, SHA-256 `6c909d1c5a51fc59fcf3c4c266c537970b9919a41f3195d3d20e6fc0cc505ac4` — NOT committed (londat's raw folder, git-ignored); 4,063,687 records

### overture-buildings-N92000002: Overture Maps Foundation, buildings theme, release 2026-09-23.1 (GeoParquet on the public bucket overturemaps-us-west-2), read by bounding box with DuckDB

- Register source: `overture-buildings` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (buildings theme); per record and property the sources list names the original dataset and its licence (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© Overture Maps Foundation; © OpenStreetMap contributors; © Microsoft (and the other sources named per record)"
- Fetched: 2026-10-23T11:39:39.081Z
- Request: `s3://overturemaps-us-west-2/release/2026-09-23.1/theme=buildings/type=building/ (bbox -8.18,54.02,-5.43,55.32; files part-00113-2d49482a-065f-52da-9587-cfea68852c87-c000.zstd.parquet part-00115-e2edec8c-c8d8-5b57-ab5a-e7aa714b6e6a-c000.zstd.parquet part-00119-81622b81-48e8-52c6-9401-fee68c213e71-c000.zstd.parquet)` — DuckDB read_parquet over HTTPS of the 512 files of the release, filter on bbox and: is_underground IS NOT TRUE; columns subtype, class, names.primary, height, num_floors; slim mode (centroid, area in m2, cut sources, the minimum rotated rectangle in metres as o = [angle of the long side from east, long m, short m]; the outline only when: names.primary IS NOT NULL OR am >= 2000 OR height >= 20 OR class IN ('cathedral', 'castle', 'palace', 'stadium', 'grandstand', 'tower', 'lighthouse', 'windmill') OR osm_id IN (SELECT id FROM ids); ids = the OSM ids of the landmark tags, SHA-256 73e92c9df1ea71ad2f9832230434dc3ee2da7d5e9428227ee2ad925e2c32cc31); rows ordered by id (fetch-overture-theme.py, .ndjson)
- As fetched: the query answer as written by cwplans/tools/fetch-overture-theme.py (raw folder, NDJSON); sha256 above
- Stored for the build: `data/raw/places/uk-lite/overture-N92000002-2026-09-23.1.ndjson`, 473075406 bytes, SHA-256 `d7aea75016d749f044b52bcb3d870f1cac47eaf2e6acf0f21d63f0e33ae44a9d` — NOT committed (londat's raw folder, git-ignored); 1,511,014 records

### osm-part-shapes: OpenStreetMap

- Register source: `osm` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© OpenStreetMap contributors"
- Fetched: 2026-10-23T11:48:19.578Z
- Request: `https://qlever.dev/api/osm-planet` — SPARQL POST (text/tab-separated-values): PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:> PREFIX osmrel: <https://www.openstreetmap.org/relation/> PREFIX ogc: <http://www.opengis.net/rdf#> SELECT ?p ?rs ?bp WHERE { osmrel:62149 ogc:sfContains ?p . ?p osmkey:building:part ?bp . OPTIONAL { ?p osmkey:roof:shape ?rs } FILTER(?bp IN ("spire", "steeple", "tower", "church_tower", "bell_tower", "clock_tower", "minaret", "belfry") \|\| ?rs IN ("pyramidal", "cone", "conical", "spire", "dome", "onion")) }
- As fetched: 173003 bytes, SHA-256 `967fe4cbbcb2b96bfd16dad6e3a34888b71cba858f70da5c31ddad62cf2a9071`
- Stored for the build: `data/raw/places/uk-lite/osm-part-shapes.tsv`, 173003 bytes, SHA-256 `967fe4cbbcb2b96bfd16dad6e3a34888b71cba858f70da5c31ddad62cf2a9071` — NOT committed (londat's raw folder, git-ignored); 2,738 rows

### osm-structures: OpenStreetMap

- Register source: `osm` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: ODbL 1.0 (https://opendatacommons.org/licenses/odbl/1-0/)
- Credit (exact text): "© OpenStreetMap contributors"
- Fetched: 2026-10-23T11:48:33.497Z
- Request: `https://qlever.dev/api/osm-planet` — SPARQL POST (text/tab-separated-values): PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:> PREFIX osmrel: <https://www.openstreetmap.org/relation/> PREFIX ogc: <http://www.opengis.net/rdf#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> SELECT ?e ?mm ?hist ?tour ?name ?h ?wd ?wp ?wkt WHERE { osmrel:62149 ogc:sfContains ?e . OPTIONAL { ?e osmkey:man_made ?mm } OPTIONAL { ?e osmkey:historic ?hist } OPTIONAL { ?e osmkey:tourism ?tour } FILTER(?mm IN ("tower", "chimney", "obelisk", "lighthouse", "mast", "monument") \|\| ?hist IN ("monument", "memorial", "castle") \|\| ?tour IN ("artwork")) FILTER NOT EXISTS { ?e osmkey:building ?b } OPTIONAL { ?e osmkey:name ?name } OPTIONAL { ?e osmkey:height ?h } OPTIONAL { ?e osmkey:wikidata ?wd } OPTIONAL { ?e osmkey:wikipedia ?wp } FILTER(BOUND(?wd) \|\| BOUND(?wp) \|\| (BOUND(?name) && BOUND(?h))) ?e geo:hasGeometry/geo:asWKT ?wkt . }
- As fetched: 913419 bytes, SHA-256 `489a7a0036f0bfbdc0b759641f53166f1d53b1da493c379d9985b84291888dda`
- Stored for the build: `data/raw/places/uk-lite/osm-structures.tsv`, 913419 bytes, SHA-256 `489a7a0036f0bfbdc0b759641f53166f1d53b1da493c379d9985b84291888dda` — NOT committed (londat's raw folder, git-ignored); 4,522 rows

### wikidata-heights-structures: Wikidata (SPARQL; QLever for the registry)

- Register source: `wikidata` ([DATA-REGISTER.md](https://github.com/danbri/londat/blob/main/cwplans/DATA-REGISTER.md))
- Licence: CC0 1.0
- Credit (exact text): ""
- Fetched: 2026-10-23T11:48:34.914Z
- Request: `https://qlever.dev/api/wikidata` — SPARQL POST (text/tab-separated-values), 1 request(s): the P2048 (height) statements of the 4028 wikidata items of the structures
- As fetched: 25684 bytes, SHA-256 `0335899f256aece0947a8cb26a907af409316eff9e9e29440f828ce16afdc622` (undefined)
- Stored for the build: `data/raw/places/uk-lite/wikidata-heights-structures.tsv`, 25684 bytes, SHA-256 `0335899f256aece0947a8cb26a907af409316eff9e9e29440f828ce16afdc622` — NOT committed (londat's raw folder, git-ignored); 201 rows

Also read (committed in londat): the UK skeleton polygons (`cwplans/docklands/data/uk/layers/regions/6/`, `countries/6/`; ONS, OGL v3.0), Natural Earth countries (`cwplans/docklands/data/world/countries.json`; public domain), the world-base heights (`cwplans/docklands/data/world-base/dem/`; Copernicus GLO-90) and the EGM96 geoid grid (`cwplans/docklands/data/world/geoid-egm96-1deg.png`).

## Operations (dataflow, skill cwplans-dataflow)

Each activity: id = sha256 of [operation, version, input hashes, parameters], first 16 hex. Inputs and outputs by SHA-256; a re-run with the same inputs writes nothing. Outputs under `data/raw/` (londat) are intermediate (not committed); their hashes fix the next step. Paths `docklandia:...` are in this repository.

### place-lite-select version 2 (E12000001 North East) (activity `4099d6e062758925`, 2026-10-23T10:41:05.289Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000001: `data/raw/places/uk-lite/overture-E12000001-2026-09-23.1.ndjson` SHA-256 `f9efc5aaa735b83d5d4ce74b11cde781a415984afc38b76f8870bdd47d61194e`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000001-atoms.ndjson.gz` SHA-256 `f68e7098113a9e734716f326aa471dddd03c967fe5ae6fac5ed720fa4b91db82` (802377 bytes)
- `data/raw/places/uk-lite/work/lite-E12000001-buildings.bin.gz` SHA-256 `525653d449c09b0937d2e8a41e956c553384326ebcd555ce18a71103fb908637` (12230950 bytes)
- `data/raw/places/uk-lite/work/lite-E12000001-landmarks.json.gz` SHA-256 `958f47d3e648ff58dd01bf9191be13b826483e65820554fcf70598857891ab55` (601803 bytes)
- `data/raw/places/uk-lite/work/lite-E12000001-counts.json` SHA-256 `cc889c17302d58eb82d46de0c21dd39fe371269481a843979b875a0efefc94a0` (893 bytes)

Parameters: `{"part":"E12000001","part_index":0,"name":"North East","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000002 North West) (activity `6373e7624ba523e0`, 2026-10-23T10:46:15.836Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000002: `data/raw/places/uk-lite/overture-E12000002-2026-09-23.1.ndjson` SHA-256 `0d95dbf52743dfd648a507b9a8cc687259c17475b3f2292298c952c13f140cee`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000002-atoms.ndjson.gz` SHA-256 `cbff83701929b1db4a90c76aa9acebfc108ef6c83ce60d158054734e65a4fad8` (2021583 bytes)
- `data/raw/places/uk-lite/work/lite-E12000002-buildings.bin.gz` SHA-256 `aaa513fbad742cbf6da97322624ac62628f3e962047a3a9440d60a75149930a0` (33608091 bytes)
- `data/raw/places/uk-lite/work/lite-E12000002-landmarks.json.gz` SHA-256 `b01486bc068587561be2b2433a40ea0153def18f3cf5666f0584978e0805d3e7` (1260966 bytes)
- `data/raw/places/uk-lite/work/lite-E12000002-counts.json` SHA-256 `ca5183dc45de03ff6b81656fd702d366c3a6a1ac344061042978a741dff15837` (939 bytes)

Parameters: `{"part":"E12000002","part_index":1,"name":"North West","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000003 Yorkshire and The Humber) (activity `f5a42a508ef22e75`, 2026-10-23T10:51:39.950Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000003: `data/raw/places/uk-lite/overture-E12000003-2026-09-23.1.ndjson` SHA-256 `74e3e3806b67ae700f707ebd2ec127c75f08414fa906a6f7d4a707219ea169d4`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000003-atoms.ndjson.gz` SHA-256 `53ff6bfbb78c30c086073091da0fdcfe3fec66271975c8495871c6cd8a0491f5` (1826617 bytes)
- `data/raw/places/uk-lite/work/lite-E12000003-buildings.bin.gz` SHA-256 `6bc83d02cc9f889984fa65c7991884d56fc64955f76d8cfe144c9175c06db872` (28416127 bytes)
- `data/raw/places/uk-lite/work/lite-E12000003-landmarks.json.gz` SHA-256 `6eda7b19b70b5659f5f8f60978876e8c61072b90406966fbf9438ebf2d65216e` (1243210 bytes)
- `data/raw/places/uk-lite/work/lite-E12000003-counts.json` SHA-256 `4576a4a485de7564637a968d0ea45a3189f0bd8414efc0fdb9c7fcba5471d8e1` (951 bytes)

Parameters: `{"part":"E12000003","part_index":2,"name":"Yorkshire and The Humber","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000004 East Midlands) (activity `a9c3831282fc61d0`, 2026-10-23T10:58:12.455Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000004: `data/raw/places/uk-lite/overture-E12000004-2026-09-23.1.ndjson` SHA-256 `4204e9ec7abb34b16f62edc10c1cf433633acc36ce43d0a5c184d124e329a708`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000004-atoms.ndjson.gz` SHA-256 `d2a6bf23699f36a5e9f646cd600de05572269fd6995245145282972e13d6880a` (1918658 bytes)
- `data/raw/places/uk-lite/work/lite-E12000004-buildings.bin.gz` SHA-256 `ee20bb713c150cafa82a66c38d8c0310388be0cae63526db2d5291c85072f668` (27186612 bytes)
- `data/raw/places/uk-lite/work/lite-E12000004-landmarks.json.gz` SHA-256 `a6b02bdc908c4ffaa97f5cd4ef42ff147f6102b0b6a754cc2af387b83bfb461d` (1030611 bytes)
- `data/raw/places/uk-lite/work/lite-E12000004-counts.json` SHA-256 `7bc2ca9584b66aab4337672bc98da59465123bff37ada5b076dec4cedc201f6c` (937 bytes)

Parameters: `{"part":"E12000004","part_index":3,"name":"East Midlands","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000005 West Midlands) (activity `d335283ec89efdce`, 2026-10-23T11:03:55.679Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000005: `data/raw/places/uk-lite/overture-E12000005-2026-09-23.1.ndjson` SHA-256 `b7ba6cc5ed9b3781081972fe75378f1cc558c3f1c8f2b0da61ec97e9548a91ac`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000005-atoms.ndjson.gz` SHA-256 `ecf504d8d57567c1ae10016b0f8f98dcf1762903d03cba72aa88801f8a35e4b1` (2092644 bytes)
- `data/raw/places/uk-lite/work/lite-E12000005-buildings.bin.gz` SHA-256 `3d5b1c0aae8e831806e5b8d77af4287e9ac33269b03bf7ae090e8855c6e3641c` (27682384 bytes)
- `data/raw/places/uk-lite/work/lite-E12000005-landmarks.json.gz` SHA-256 `4c3f3702bd1460e643794f81d207c7c3853b628708f448c5a9b1ad8961327d72` (1162668 bytes)
- `data/raw/places/uk-lite/work/lite-E12000005-counts.json` SHA-256 `af60df3bbf29a8be8eef5c01ca071a73c36947d62e72ec83089d6a91521dc80f` (891 bytes)

Parameters: `{"part":"E12000005","part_index":4,"name":"West Midlands","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000006 East of England) (activity `026eb34166d80d41`, 2026-10-23T11:10:26.772Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000006: `data/raw/places/uk-lite/overture-E12000006-2026-09-23.1.ndjson` SHA-256 `cfd832456487f497cbf2ae2dcf56ce0b87c3e496595f67e41a8a475dd5677d32`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000006-atoms.ndjson.gz` SHA-256 `e4635a7079b040e29a2897611d81a12dbb0290a2b5fc5718eb50f13b422d261b` (2563334 bytes)
- `data/raw/places/uk-lite/work/lite-E12000006-buildings.bin.gz` SHA-256 `d4cef787b2c7f1e825148219dcdb0796f52218b039ce6a5953fe13405dbf21ca` (33954437 bytes)
- `data/raw/places/uk-lite/work/lite-E12000006-landmarks.json.gz` SHA-256 `6b9f273e6619f71eb02b421f4716ecbfe0177db23fd7ba451ce59297ca542d55` (1737846 bytes)
- `data/raw/places/uk-lite/work/lite-E12000006-counts.json` SHA-256 `ef9537c9a542beb8161b12b6dd26916b59156cba33b0d392a31e57db5f2e289b` (989 bytes)

Parameters: `{"part":"E12000006","part_index":5,"name":"East of England","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000008 South East) (activity `1f677d7b2e0a9fa3`, 2026-10-23T11:19:26.203Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000008: `data/raw/places/uk-lite/overture-E12000008-2026-09-23.1.ndjson` SHA-256 `5245ce6b3b83e1317fe21e5e5c5884823bfc15a4b029c4ae68c31a5d2a8f4dc9`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000008-atoms.ndjson.gz` SHA-256 `7638369301977f7c65ec56d19ac8c41b795b8fc47ce4de1ed8d353e63d9cc3f7` (3162476 bytes)
- `data/raw/places/uk-lite/work/lite-E12000008-buildings.bin.gz` SHA-256 `25ba1408902fbf153517e40ec0fb8ec51718df688e8c4fdddf6f3af9fa402974` (43865805 bytes)
- `data/raw/places/uk-lite/work/lite-E12000008-landmarks.json.gz` SHA-256 `c66ad89f72970e9e6e5ec0ae8da7b775e58fc15f18222414daed2e4350b5fc54` (2294411 bytes)
- `data/raw/places/uk-lite/work/lite-E12000008-counts.json` SHA-256 `711ec47f8a257b7b9fa650ad470b211bc5af1eeb80b5ffa4af2aac9790af4b76` (994 bytes)

Parameters: `{"part":"E12000008","part_index":6,"name":"South East","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (E12000009 South West) (activity `db0b6d132a7837fc`, 2026-10-23T11:25:39.284Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings E12000009: `data/raw/places/uk-lite/overture-E12000009-2026-09-23.1.ndjson` SHA-256 `4a7a1ea8535520e8128585bb65ef95c333a570cdabd47eb072f9264b3cef4ed1`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-E12000009-atoms.ndjson.gz` SHA-256 `78e7e6f74a57a85c98719413522846c9065949b803ebd9f2eaa21f3997075f28` (3147027 bytes)
- `data/raw/places/uk-lite/work/lite-E12000009-buildings.bin.gz` SHA-256 `fe2c4b7dd66ad8d78537e77e8d492cc0b1615e9da755c88c248810deae8822a4` (34919541 bytes)
- `data/raw/places/uk-lite/work/lite-E12000009-landmarks.json.gz` SHA-256 `173157d0d221ae94b1cea9af4e5d514d7ddfa399515220007a2c74fede97ac7b` (2332565 bytes)
- `data/raw/places/uk-lite/work/lite-E12000009-counts.json` SHA-256 `a05312c5b190e9f910c026fcc4d9d02389543156fe54ef2c7757c299e0eb418e` (942 bytes)

Parameters: `{"part":"E12000009","part_index":7,"name":"South West","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (W92000004 Wales) (activity `c1f7f1de550376be`, 2026-10-23T11:29:57.404Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings W92000004: `data/raw/places/uk-lite/overture-W92000004-2026-09-23.1.ndjson` SHA-256 `550fe2745ffd2872f0d3a297d556b4a1b03181dc1ab237d174c988104ce744ef`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-W92000004-atoms.ndjson.gz` SHA-256 `9e852ab9fab63e4d343dcd92c12f10e57c90e3c222553dbea9ca30cc4d3b5746` (2261462 bytes)
- `data/raw/places/uk-lite/work/lite-W92000004-buildings.bin.gz` SHA-256 `4bbff24c788a5e32433a38d7b9233b6803ebb6bf21c5d2d702dbba0fcbda3353` (19494760 bytes)
- `data/raw/places/uk-lite/work/lite-W92000004-landmarks.json.gz` SHA-256 `919481a0ff6135846c86b70a8e58367119e1f22dde377e34afcc6a6f6a0f03a9` (900145 bytes)
- `data/raw/places/uk-lite/work/lite-W92000004-counts.json` SHA-256 `401136217cb27364607d1e8f3fd8b1f51c1caee8a81f97518cccd08337e5b83d` (929 bytes)

Parameters: `{"part":"W92000004","part_index":8,"name":"Wales","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (S92000003 Scotland) (activity `675c1b2a4328588b`, 2026-10-23T11:36:32.995Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings S92000003: `data/raw/places/uk-lite/overture-S92000003-2026-09-23.1.ndjson` SHA-256 `6c909d1c5a51fc59fcf3c4c266c537970b9919a41f3195d3d20e6fc0cc505ac4`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-S92000003-atoms.ndjson.gz` SHA-256 `10c43b630cc1cc2254d3db9c54d7ea214e54347d198815493bb621005314a77d` (3383969 bytes)
- `data/raw/places/uk-lite/work/lite-S92000003-buildings.bin.gz` SHA-256 `ff3fa819f2fdc3342971651af9a937b69f4b82a54906dab631b638d1584f89e5` (30663365 bytes)
- `data/raw/places/uk-lite/work/lite-S92000003-landmarks.json.gz` SHA-256 `671d0efdb6f6aeeaba8ad186f97b8d9d3bf1831831ae3a1e2084745dcc059bad` (1668937 bytes)
- `data/raw/places/uk-lite/work/lite-S92000003-counts.json` SHA-256 `5458088f567613f094ec4d511098e4b0833a75dcc9547e4e0358c2536c18e391` (942 bytes)

Parameters: `{"part":"S92000003","part_index":9,"name":"Scotland","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-select version 2 (N92000002 Northern Ireland) (activity `af80915e66ee2d06`, 2026-10-23T11:40:09.533Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- overture-buildings N92000002: `data/raw/places/uk-lite/overture-N92000002-2026-09-23.1.ndjson` SHA-256 `d7aea75016d749f044b52bcb3d870f1cac47eaf2e6acf0f21d63f0e33ae44a9d`
- osm-landmark-tags: `data/raw/places/uk-lite/osm-landmark-tags.tsv` SHA-256 `c6592b8dc5bc6951b6188b02e8bb7f51b0343448a796aa678b4a759324ad244a`
- ghsl tiles (list of zips and their SHA-256): `data/raw/places/uk-lite/ghsl-tiles.json` SHA-256 `92343b63265e714fe5e66e0a89a8b1ae494462183d1bdf6696d198aeb14a980f`
- boundary: `docklands/data/uk/layers/countries/6/61-51.json` SHA-256 `a95c55cc2d5d4358d7f4069ca3162316a74ee56a4b3d26e16ea38ae02245d7e4`
- boundary: `docklands/data/uk/layers/countries/6/62-50.json` SHA-256 `0bac2592f84234b2542a60a1c978a87b23c33356a813ba55952647bdb29a9181`
- boundary: `docklands/data/uk/layers/countries/6/62-52.json` SHA-256 `d014fa8d203953823bc6b75dbf0f724a25379c1124e8963a600afe3d0d8ab1c3`
- boundary: `docklands/data/uk/layers/regions/6/62-50.json` SHA-256 `3a65339ae5c49a8e4b61945880e54e02224ffe4e54478a9a5643f28f5b5883eb`
- boundary: `docklands/data/uk/layers/regions/6/63-50.json` SHA-256 `4e1cbe914d1f30238a5f6fa108de8bb84fc103246c4fb2fe194e96e85eb2c521`
- boundary: `docklands/data/uk/layers/regions/6/63-51.json` SHA-256 `5cedfa16f8039c49074e39895950c8ecc00ffaaa1d9c72ff2643fe1afb6469fe`
- boundary: `docklands/data/uk/layers/regions/6/64-50.json` SHA-256 `708237b8043dc1614dbcac55f67c401d6fe619ebacbb58b2d9330b719a8e8c0d`
- boundary: `docklands/data/world/countries.json` SHA-256 `92d9226de479afef17fbf9e0e43ff353feaf2ba45993a485ff3a90f850263043`

Outputs:

- `data/raw/places/uk-lite/work/lite-N92000002-atoms.ndjson.gz` SHA-256 `bfc511ac097fa56efba73c36f8722680a11942fc07543e25d978f4cc43fe5f5b` (2120761 bytes)
- `data/raw/places/uk-lite/work/lite-N92000002-buildings.bin.gz` SHA-256 `732e8e64203833a66d8923bfdbc2f5a1e6c6e94a9ca1dd725d9489b3e8236245` (15485481 bytes)
- `data/raw/places/uk-lite/work/lite-N92000002-landmarks.json.gz` SHA-256 `01c8785394c7c2a5ce0961e32eab9bfb14ef9917f68f1d732611aee92ad1fd0f` (209338 bytes)
- `data/raw/places/uk-lite/work/lite-N92000002-counts.json` SHA-256 `51315d6cece71e309654aa8c0172c210f564c3d2be929b0b16eca2373ef9b00b` (907 bytes)

Parameters: `{"part":"N92000002","part_index":10,"name":"Northern Ireland","parts":["E12000001","E12000002","E12000003","E12000004","E12000005","E12000006","E12000008","E12000009","W92000004","S92000003","N92000002"],"exclude":["E12000007"],"coast_m":250,"not_in_countries":{"file":"docklands/data/world/countries.json","iso2":["IE"]},"geometry_classes":{"OpenStreetMap":"osm","Microsoft ML Buildings":"ms"},"licences":["ODbL-1.0","CDLA-Permissive-2.0","CDLA-Permissive-1.0","CC-BY-4.0","CC0-1.0"],"rule":{"encyclopaedic":true,"building":["cathedral","castle","palace","stadium","grandstand","tower","lighthouse","windmill"],"historic":["castle","palace","fort","tower","monastery","abbey","city_gate"],"man_made":["tower","lighthouse","windmill","water_tower"],"leisure":["stadium"],"named_tall_m":25,"named_big_m2":3000,"min_area_m2":20},"level":11,"atom_m":200,"storey_m":3,"small_m":3,"default_m":7,"raster_min_m":3,"height_rule":"OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings: \"ms\") > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell under the centroid (min 3 m) > default"}`

### place-lite-landmark-heights version 2 (activity `fe67c4bb9e5050a7`, 2026-10-23T12:22:04.734Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- landmarks E12000001: `data/raw/places/uk-lite/work/lite-E12000001-landmarks.json.gz` SHA-256 `958f47d3e648ff58dd01bf9191be13b826483e65820554fcf70598857891ab55`
- landmarks E12000002: `data/raw/places/uk-lite/work/lite-E12000002-landmarks.json.gz` SHA-256 `b01486bc068587561be2b2433a40ea0153def18f3cf5666f0584978e0805d3e7`
- landmarks E12000003: `data/raw/places/uk-lite/work/lite-E12000003-landmarks.json.gz` SHA-256 `6eda7b19b70b5659f5f8f60978876e8c61072b90406966fbf9438ebf2d65216e`
- landmarks E12000004: `data/raw/places/uk-lite/work/lite-E12000004-landmarks.json.gz` SHA-256 `a6b02bdc908c4ffaa97f5cd4ef42ff147f6102b0b6a754cc2af387b83bfb461d`
- landmarks E12000005: `data/raw/places/uk-lite/work/lite-E12000005-landmarks.json.gz` SHA-256 `4c3f3702bd1460e643794f81d207c7c3853b628708f448c5a9b1ad8961327d72`
- landmarks E12000006: `data/raw/places/uk-lite/work/lite-E12000006-landmarks.json.gz` SHA-256 `6b9f273e6619f71eb02b421f4716ecbfe0177db23fd7ba451ce59297ca542d55`
- landmarks E12000008: `data/raw/places/uk-lite/work/lite-E12000008-landmarks.json.gz` SHA-256 `c66ad89f72970e9e6e5ec0ae8da7b775e58fc15f18222414daed2e4350b5fc54`
- landmarks E12000009: `data/raw/places/uk-lite/work/lite-E12000009-landmarks.json.gz` SHA-256 `173157d0d221ae94b1cea9af4e5d514d7ddfa399515220007a2c74fede97ac7b`
- landmarks W92000004: `data/raw/places/uk-lite/work/lite-W92000004-landmarks.json.gz` SHA-256 `919481a0ff6135846c86b70a8e58367119e1f22dde377e34afcc6a6f6a0f03a9`
- landmarks S92000003: `data/raw/places/uk-lite/work/lite-S92000003-landmarks.json.gz` SHA-256 `671d0efdb6f6aeeaba8ad186f97b8d9d3bf1831831ae3a1e2084745dcc059bad`
- landmarks N92000002: `data/raw/places/uk-lite/work/lite-N92000002-landmarks.json.gz` SHA-256 `01c8785394c7c2a5ce0961e32eab9bfb14ef9917f68f1d732611aee92ad1fd0f`
- overture building parts: `data/raw/places/uk-lite/overture-building-parts-2026-09-23.1.ndjson` SHA-256 `5fc23d4beb97b4e16f64bf1230b4c24094f54b77b5c1c821e5aaee2d8d96dc6c`
- wikidata heights: `data/raw/places/uk-lite/wikidata-heights.tsv` SHA-256 `e184b6056752ddbf0be048672f6e83cc8d0dbb3ea56b0c02154febd6d8acfb4e`
- osm part shapes: `data/raw/places/uk-lite/osm-part-shapes.tsv` SHA-256 `967fe4cbbcb2b96bfd16dad6e3a34888b71cba858f70da5c31ddad62cf2a9071`

Outputs:

- `data/raw/places/uk-lite/work/lite-landmark-heights.json.gz` SHA-256 `727181e27296211f45f90fd4297eda134c090ceab7853c710be1baa9ae81370a` (184191 bytes)
- `data/raw/places/uk-lite/work/lite-landmark-heights-counts.json` SHA-256 `6627ee3cebc12850149cc76bd643d59b23ef06c6957f5f1495ff26dfda825dd5` (697 bytes)

Parameters: `{"rule":{"rise_m":3,"rise_share":0.15,"max_parts":64,"max_wd_m":330,"spire_share":0.35,"tower_share":0.2,"tower_min_m":4,"tower_max_m":15,"cap_share":0.25,"cap_max_m":8}}`

### place-lite-tiles version 7 (activity `407226549b64346a`, 2026-10-23T16:09:26.873Z)

Skill docklands-3d-page; tool tools/build-place-tiles.mjs.

Inputs:

- building records E12000001: `data/raw/places/uk-lite/work/lite-E12000001-buildings.bin.gz` SHA-256 `525653d449c09b0937d2e8a41e956c553384326ebcd555ce18a71103fb908637`
- landmarks E12000001: `data/raw/places/uk-lite/work/lite-E12000001-landmarks.json.gz` SHA-256 `958f47d3e648ff58dd01bf9191be13b826483e65820554fcf70598857891ab55`
- building records E12000002: `data/raw/places/uk-lite/work/lite-E12000002-buildings.bin.gz` SHA-256 `aaa513fbad742cbf6da97322624ac62628f3e962047a3a9440d60a75149930a0`
- landmarks E12000002: `data/raw/places/uk-lite/work/lite-E12000002-landmarks.json.gz` SHA-256 `b01486bc068587561be2b2433a40ea0153def18f3cf5666f0584978e0805d3e7`
- building records E12000003: `data/raw/places/uk-lite/work/lite-E12000003-buildings.bin.gz` SHA-256 `6bc83d02cc9f889984fa65c7991884d56fc64955f76d8cfe144c9175c06db872`
- landmarks E12000003: `data/raw/places/uk-lite/work/lite-E12000003-landmarks.json.gz` SHA-256 `6eda7b19b70b5659f5f8f60978876e8c61072b90406966fbf9438ebf2d65216e`
- building records E12000004: `data/raw/places/uk-lite/work/lite-E12000004-buildings.bin.gz` SHA-256 `ee20bb713c150cafa82a66c38d8c0310388be0cae63526db2d5291c85072f668`
- landmarks E12000004: `data/raw/places/uk-lite/work/lite-E12000004-landmarks.json.gz` SHA-256 `a6b02bdc908c4ffaa97f5cd4ef42ff147f6102b0b6a754cc2af387b83bfb461d`
- building records E12000005: `data/raw/places/uk-lite/work/lite-E12000005-buildings.bin.gz` SHA-256 `3d5b1c0aae8e831806e5b8d77af4287e9ac33269b03bf7ae090e8855c6e3641c`
- landmarks E12000005: `data/raw/places/uk-lite/work/lite-E12000005-landmarks.json.gz` SHA-256 `4c3f3702bd1460e643794f81d207c7c3853b628708f448c5a9b1ad8961327d72`
- building records E12000006: `data/raw/places/uk-lite/work/lite-E12000006-buildings.bin.gz` SHA-256 `d4cef787b2c7f1e825148219dcdb0796f52218b039ce6a5953fe13405dbf21ca`
- landmarks E12000006: `data/raw/places/uk-lite/work/lite-E12000006-landmarks.json.gz` SHA-256 `6b9f273e6619f71eb02b421f4716ecbfe0177db23fd7ba451ce59297ca542d55`
- building records E12000008: `data/raw/places/uk-lite/work/lite-E12000008-buildings.bin.gz` SHA-256 `25ba1408902fbf153517e40ec0fb8ec51718df688e8c4fdddf6f3af9fa402974`
- landmarks E12000008: `data/raw/places/uk-lite/work/lite-E12000008-landmarks.json.gz` SHA-256 `c66ad89f72970e9e6e5ec0ae8da7b775e58fc15f18222414daed2e4350b5fc54`
- building records E12000009: `data/raw/places/uk-lite/work/lite-E12000009-buildings.bin.gz` SHA-256 `fe2c4b7dd66ad8d78537e77e8d492cc0b1615e9da755c88c248810deae8822a4`
- landmarks E12000009: `data/raw/places/uk-lite/work/lite-E12000009-landmarks.json.gz` SHA-256 `173157d0d221ae94b1cea9af4e5d514d7ddfa399515220007a2c74fede97ac7b`
- building records W92000004: `data/raw/places/uk-lite/work/lite-W92000004-buildings.bin.gz` SHA-256 `4bbff24c788a5e32433a38d7b9233b6803ebb6bf21c5d2d702dbba0fcbda3353`
- landmarks W92000004: `data/raw/places/uk-lite/work/lite-W92000004-landmarks.json.gz` SHA-256 `919481a0ff6135846c86b70a8e58367119e1f22dde377e34afcc6a6f6a0f03a9`
- building records S92000003: `data/raw/places/uk-lite/work/lite-S92000003-buildings.bin.gz` SHA-256 `ff3fa819f2fdc3342971651af9a937b69f4b82a54906dab631b638d1584f89e5`
- landmarks S92000003: `data/raw/places/uk-lite/work/lite-S92000003-landmarks.json.gz` SHA-256 `671d0efdb6f6aeeaba8ad186f97b8d9d3bf1831831ae3a1e2084745dcc059bad`
- building records N92000002: `data/raw/places/uk-lite/work/lite-N92000002-buildings.bin.gz` SHA-256 `732e8e64203833a66d8923bfdbc2f5a1e6c6e94a9ca1dd725d9489b3e8236245`
- landmarks N92000002: `data/raw/places/uk-lite/work/lite-N92000002-landmarks.json.gz` SHA-256 `01c8785394c7c2a5ce0961e32eab9bfb14ef9917f68f1d732611aee92ad1fd0f`
- landmark heights: `data/raw/places/uk-lite/work/lite-landmark-heights.json.gz` SHA-256 `727181e27296211f45f90fd4297eda134c090ceab7853c710be1baa9ae81370a`
- structures: `data/raw/places/uk-lite/work/lite-structures.json.gz` SHA-256 `e0d54a21c491ebc10b05a4463a684fe22fb0df42fcc7203af2c6686368fd6c0c`
- world-base heights: `docklands/data/world-basedem (287 tiles over the UK box; sha256 of the list of path and sha256 of each)` SHA-256 `681c431d557f86e695e8ae42cc09e4b67fba561259938507cd8760de29367585`
- geoid: `docklands/data/world/geoid-egm96-1deg.png` SHA-256 `4e9eb4b3ac040dd6276ba74310a405fab7d5c9955c005c8f84a49103318c26ca`
- world terrain texture: `docklands/data/world/terrain-4096x2048.png` SHA-256 `c98bbf1ffc2ac9db5fd796f1bee160f22561b032b691d938195243624febbb5b`

Outputs:

- `docklandia:data/gb/uk-lite/tiles/11-1950-1681.glb` SHA-256 `b8deec29e60cfb419f938e8a667b035c734dcb63c7b38803542d13c34ced63d2` (5088 bytes)
- `docklandia:data/gb/uk-lite/tiles/10-975-840.glb` SHA-256 `cc5301e42d801bc246c350aeaae49a09e144cec8bf666f23d464d364bac266e7` (2512 bytes)
- `docklandia:data/gb/uk-lite/tiles/9-487-420.glb` SHA-256 `2a2fc90c3135cf6dcbe90248a56e6396df92dc7065558bd92bf2449f1eac50b9` (2464 bytes)
- `docklandia:data/gb/uk-lite/tiles/8-243-210.glb` SHA-256 `7afc49e70bd65f778d6b65452144690a57d12fd35b09b8730907ffb2b7f5228a` (1084 bytes)
- and 7,198 more (tiles and tile sets: the Files table above)

Parameters: `{"top":7,"leaf":11,"levels":{"7":{"tall_m":150,"big_m2":150000,"merge_m":1600,"err_m":2560},"8":{"tall_m":90,"big_m2":60000,"merge_m":800,"err_m":1280},"9":{"tall_m":60,"big_m2":25000,"merge_m":400,"err_m":640},"10":{"tall_m":40,"big_m2":10000,"merge_m":200,"err_m":160}},"leafRule":{"town_m":200,"rural_m":400,"town_share":0.08,"simplify_m":1.5},"full_share":0.5,"drop_m":8,"external_from":9,"colour":"#d6cbb6","version_label":"uk-lite-3","grid_n":17,"far":{"gap_m":5,"fill_min":0.7,"h_rel":0.35,"h_abs_m":3,"box_fill":0.7,"simplify_m":4,"min_m2":{"7":11400,"8":2850,"9":712,"10":178}},"classes":["landmark (OpenStreetMap)","merged buildings (OpenStreetMap and Microsoft)","OpenStreetMap","Microsoft ML Buildings"],"credit":"© OpenStreetMap contributors (ODbL 1.0); Landmark tags: OpenStreetMap via the QLever OSM endpoint (planet 2026-09-21); Buildings: OpenStreetMap data and Microsoft ML Buildings footprints via Overture Maps © Overture Maps Foundation, © Microsoft (ODbL 1.0); Building heights and floors from Overture Maps buildings © Overture Maps Foundation (ODbL 1.0; includes data © Microsoft, © OpenStreetMap contributors and others per record); Building heights from Microsoft Global ML Building Footprints © Microsoft (ODbL 1.0); Building heights (where OSM has none) from GHS-BUILT-H R2023A © European Union, 1995-2026, JRC (CC BY 4.0); Ground: Copernicus DEM GLO-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union an`

## What is derived from what

- `place-lite-select` (one activity per part): the Overture buildings answer of the part's box (slim NDJSON, raw) + the landmark tags (QLever TSV, raw) + the GHSL tiles (raw zips) + the skeleton and Natural Earth polygons -> the part's landmarks (outline, name, kind, Wikidata, Wikipedia, height and its source, the rule), one 20-byte record for each other building (centroid, footprint area, height, angle and aspect of its minimum rotated rectangle, footprint class, height source; sorted by leaf cell) and its atoms (200 m squares of the level-11 cells), with counts.
- `place-lite-landmark-heights`: the landmarks of every part + the Overture building parts (raw NDJSON) + the Wikidata heights (QLever TSV, raw) -> the towers, spires and highest point of each landmark that has one (gzip JSON, raw) with counts.
- `place-lite-tiles`: the building records and landmarks of every part, the landmark heights + the globe's world-base height tiles + the EGM96 geoid grid + the world terrain texture -> `tiles/*.glb`, `tilesets/*.json`, `tileset.json`, `features.json`, `names.json`.
- londat's `cwplans/docklands/data/places/index.json` (the entry with tileBase) and this README are made from these files.

## Heights (fault F55: counted, not patched)

Order: OSM height > OSM building:levels x 3 m > height of a non-OSM source with an open licence (Microsoft ML Buildings) > num_floors of such a source x 3 m > small kinds 3 m > GHSL cell mean under the centroid (min 3 m) > 7 m. Landmark heights are often low (a cathedral's Microsoft height is its roof, not its tower).

| height source | buildings |
|---|---|
| ms | 10,806,237 |
| ghsl | 9,882,125 |
| osm-levels | 1,482,960 |
| default-small | 356,888 |
| default | 142,489 |
| osm-height | 73,760 |

## Review status

- OSM (ODbL 1.0, share-alike): allowed for the prototyping phase (owner, 2026-10-03); to be reviewed with the rest of the OSM use.
- Overture Maps buildings and Microsoft ML Buildings footprints and heights (ODbL 1.0, share-alike): allowed by the owner on 2026-10-20 ("Use ms/overture"); Microsoft footprints in the mass where OSM has none (owner, 2026-10-22, decision on London: "yes"). Registered next to OSM; credit kept. Height values whose source licence is not open are neither used nor committed (counts above).
- GHSL GHS-BUILT-H (CC BY 4.0), Copernicus GLO-90 heights of the globe, ONS boundaries (OGL v3.0), Natural Earth (public domain): open.

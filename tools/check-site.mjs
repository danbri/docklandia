// Checks the staged Pages site of docklandia before a deploy and writes its hash manifest.
//   node tools/check-site.mjs <site-dir>
// Fails when a file is over 100 MB, the site is over 950 MB (GitHub Pages limit 1 GB), or a data set (a folder
// data/<country>/<set>/ or data/world/<set>/) has no README.md. Writes <site-dir>/manifest.json: { generated, files:
// { path: { bytes, sha256 } } } for the londat service worker and for provenance.
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root = process.argv[2] || '_site', files = {}, problems = []; let total = 0;
const walk = d => { for (const n of readdirSync(d)) { const p = join(d, n), s = statSync(p);
  if (s.isDirectory()) walk(p); else { const r = relative(root, p); total += s.size;
    if (s.size > 100e6) problems.push(`over 100 MB: ${r}`);
    files[r] = { bytes: s.size, sha256: createHash('sha256').update(readFileSync(p)).digest('hex') }; } } };
walk(root);
if (total > 950e6) problems.push(`site is ${(total / 1e6).toFixed(1)} MB (limit 950 MB)`);
const data = join(root, 'data');
if (existsSync(data)) for (const c of readdirSync(data)) { const cd = join(data, c); if (!statSync(cd).isDirectory()) continue;
  for (const set of readdirSync(cd)) { const sd = join(cd, set); if (statSync(sd).isDirectory() && !existsSync(join(sd, 'README.md'))) problems.push(`no README.md: data/${c}/${set}/`); } }
writeFileSync(join(root, 'manifest.json'), JSON.stringify({ generated: new Date().toISOString(), files }));
console.log(`${Object.keys(files).length} files, ${(total / 1e6).toFixed(1)} MB`);
for (const p of problems) console.log('FAIL ' + p);
process.exit(problems.length ? 1 : 0);

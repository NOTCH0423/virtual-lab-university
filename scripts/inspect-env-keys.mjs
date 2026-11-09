import fs from 'fs';

for (const file of ['.env.neon', '.env.production', '.env.local']) {
  if (!fs.existsSync(file)) {
    console.log(file + ': missing');
    continue;
  }
  const t = fs.readFileSync(file, 'utf8');
  const keys = [...t.matchAll(/^([A-Z0-9_]+)=/gm)].map((m) => m[1]);
  console.log(file + ': ' + keys.join(', '));
  const m = t.match(/^DATABASE_URL=(.*)$/m);
  if (m) {
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v.includes('[SENSITIVE]') || v.includes('TU_USUARIO') || v.includes('@host')) {
      console.log('  DATABASE_URL: PLACEHOLDER');
    } else {
      try {
        const u = new URL(v);
        console.log('  DATABASE_URL host=' + u.hostname);
      } catch {
        console.log('  DATABASE_URL: INVALID');
      }
    }
  }
}

import fs from 'fs';

const t = fs.readFileSync('.env.production', 'utf8');
const m = t.match(/^DATABASE_URL=(.*)$/m);
if (!m) {
  console.log('NO_MATCH');
  process.exit(1);
}
let v = m[1].trim();
if (
  (v.startsWith('"') && v.endsWith('"')) ||
  (v.startsWith("'") && v.endsWith("'"))
) {
  v = v.slice(1, -1);
}
const u = new URL(v);
console.log('protocol=' + u.protocol);
console.log('hostname=' + u.hostname);
console.log('port=' + u.port);
console.log('db=' + u.pathname);
console.log('user=' + u.username);
console.log('hasPass=' + Boolean(u.password));
console.log('ssl=' + (u.searchParams.get('sslmode') || ''));
console.log('len=' + v.length);

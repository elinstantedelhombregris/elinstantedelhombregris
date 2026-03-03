const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '..', 'local.db');
const outPath = path.resolve(__dirname, 'meaning-network.gource.log');

const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
  'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'habia',
  'ser', 'es', 'son', 'esta', 'estan', 'este', 'esten', 'sea', 'sean',
  'ha', 'han', 'he', 'has', 'hay', 'habia', 'habian', 'habra', 'habran',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'le', 'les', 'lo', 'la', 'los', 'las',
  'me', 'te', 'nos', 'os', 'se', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
  'mio', 'tuyo', 'suyo', 'mia', 'tuya', 'suya', 'mios', 'tuyos', 'suyos',
  'mias', 'tuyas', 'suyas', 'muy', 'mas', 'menos', 'tan', 'tanto', 'mucho', 'poco'
]);

const TYPE_DIR = {
  dream: 'suenos',
  value: 'valores',
  need: 'necesidades',
  basta: 'basta',
};

const normalizeWord = (word) => word
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[.,;:¡!¿?()[\]{}«»"'']/g, '')
  .trim();

const extractWords = (text) => {
  if (!text) return [];
  return text
    .split(/\s+/)
    .map(normalizeWord)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
};

const timelineMode = process.env.TIMELINE || 'narrative';
const durationDays = Number(process.env.DURATION_DAYS || 60);
const growthExp = Number(process.env.GROWTH_EXP || 2.6);
const topWisdomCount = Number(process.env.TOP_WISDOM || 8);

const db = new Database(dbPath, { readonly: true });
const rows = db
  .prepare(`
    SELECT id, user_id, location, type, dream, value, need, basta, created_at
    FROM dreams
    ORDER BY datetime(created_at) ASC, id ASC
  `)
  .all();

db.close();

const occurrences = [];
const wordStats = new Map();

rows.forEach((row) => {
  const user = (row.location || '').trim() || (row.user_id ? `user-${row.user_id}` : 'anon');
  const entries = [];
  if (row.dream) entries.push({ type: 'dream', text: row.dream });
  if (row.value) entries.push({ type: 'value', text: row.value });
  if (row.need) entries.push({ type: 'need', text: row.need });
  if (row.basta) entries.push({ type: 'basta', text: row.basta });

  entries.forEach(({ type, text }) => {
    const words = Array.from(new Set(extractWords(text)));
    words.forEach((word) => {
      occurrences.push({ user, type, word });
      if (!wordStats.has(word)) {
        wordStats.set(word, { total: 0, types: new Set(), users: new Set() });
      }
      const stat = wordStats.get(word);
      stat.total += 1;
      stat.types.add(type);
      stat.users.add(user);
    });
  });
});

const sharedWords = new Set(
  Array.from(wordStats.entries())
    .filter(([, stat]) => stat.types.size >= 2)
    .map(([word]) => word)
);

const topWisdomWords = Array.from(wordStats.entries())
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, topWisdomCount)
  .map(([word]) => word);

const uniqueEvents = [];
const sharedEvents = [];
const sharedTouches = new Map();

occurrences.forEach(({ user, type, word }) => {
  const dir = TYPE_DIR[type] || type || 'otros';
  const filePath = `${dir}/${word}`;
  const event = { user, filePath, kind: sharedWords.has(word) ? 'shared' : 'unique' };
  if (event.kind === 'shared') {
    sharedEvents.push(event);
    const key = `${user}::${word}`;
    if (!sharedTouches.has(key)) {
      sharedTouches.set(key, { user, filePath: `compartidas/${word}` });
    }
  } else {
    uniqueEvents.push(event);
  }
});

const wisdomEvents = [];
topWisdomWords.forEach((word) => {
  const stat = wordStats.get(word);
  if (!stat) return;
  Array.from(stat.users).forEach((user) => {
    wisdomEvents.push({ user, filePath: `sabiduria/${word}` });
  });
});

const seenFiles = new Set();
const logLines = [];

const startEpoch = (() => {
  if (timelineMode === 'real' && rows.length > 0) {
    const createdAt = rows[0].created_at ? new Date(rows[0].created_at) : new Date();
    return Math.floor(createdAt.getTime() / 1000);
  }
  return 1700000000;
})();

const segmentDefs = [
  { events: uniqueEvents, start: 0.0, end: 0.45 },
  { events: [...sharedEvents, ...sharedTouches.values()], start: 0.45, end: 0.82 },
  { events: wisdomEvents, start: 0.82, end: 1.0 },
];

const ease = (t, exp) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const numerator = Math.exp(exp * t) - 1;
  const denominator = Math.exp(exp) - 1;
  return numerator / denominator;
};

segmentDefs.forEach(({ events, start, end }) => {
  const total = events.length;
  if (total === 0) return;
  events.forEach((event, index) => {
    const t = total === 1 ? 0.5 : index / (total - 1);
    const eased = ease(t, growthExp);
    const span = start + (end - start) * eased;
    const dayOffset = Math.round(span * durationDays);
    const timestamp = startEpoch + dayOffset * 86400 + (index % 3);
    const action = seenFiles.has(event.filePath) ? 'M' : 'A';
    seenFiles.add(event.filePath);
    logLines.push(`${timestamp}|${event.user}|${action}|${event.filePath}`);
  });
});

logLines.sort((a, b) => {
  const aTime = Number(a.split('|')[0]);
  const bTime = Number(b.split('|')[0]);
  return aTime - bTime;
});

fs.writeFileSync(outPath, `${logLines.join('\n')}\n`, 'utf8');

console.log(`Wrote ${logLines.length} events to ${outPath}`);

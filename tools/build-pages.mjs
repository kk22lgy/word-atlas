import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { seed } from '../lib/vocabulary.mjs';
import { seed as original } from '../lib/original-vocabulary.mjs';
import { isFoundationWord } from '../lib/learning-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fields = [
  'word',
  'category',
  'chinese',
  'definition',
  'example',
  'phonetic',
  'partOfSpeech',
  'audio',
  'source',
];

export function publishedData(records) {
  const data = records
    .filter(
      (w) =>
        !w.archived &&
        !isFoundationWord(w.word) &&
        w.definition &&
        w.example &&
        (!w.status || w.status === 'ready'),
    )
    .map((w) => Object.fromEntries(fields.map((field) => [field, String(w[field] || '')])))
    .sort((a, b) => a.word.localeCompare(b.word, 'en'));
  if (!data.length || new Set(data.map((w) => w.word)).size !== data.length)
    throw new Error('发布词库为空或存在重复词条。');
  for (const w of data) {
    if (
      !['daily', 'travel', 'business', 'energy'].includes(w.category) ||
      !w.word ||
      w.word.length > 120
    )
      throw new Error('词条格式有误：' + w.word);
  }
  return data;
}
export function buildPages({
  outDir = resolve(root, 'docs'),
  databasePath = resolve(root, process.env.DATA_DIR || 'data', 'word-atlas.sqlite'),
  useSeed = false,
} = {}) {
  let records = seed;
  let source = '内置词库';
  if (!useSeed && existsSync(databasePath)) {
    const db = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const hasArchived = db
        .prepare('PRAGMA table_info(words)')
        .all()
        .some((c) => c.name === 'archived');
      records = db
        .prepare(`SELECT ${fields.join(',')},status${hasArchived ? ',archived' : ''} FROM words`)
        .all();
      source = '本地词库';
    } finally {
      db.close();
    }
  }
  const data = publishedData(records);
  const json = JSON.stringify(data, null, 2) + '\n';
  const manifest = {
    version: createHash('sha256').update(json).digest('hex').slice(0, 16),
    total: data.length,
    phrases: data.filter((w) => /[ -]/.test(w.word)).length,
    categories: Object.fromEntries(
      ['daily', 'travel', 'business', 'energy'].map((c) => [
        c,
        data.filter((w) => w.category === c).length,
      ]),
    ),
  };
  mkdirSync(resolve(outDir, 'data'), { recursive: true });
  for (const file of [
    'index.html',
    'app.js',
    'browser-api.js',
    'word-forms.js',
    'learning-policy.js',
    'style.css',
    'favicon.svg',
    'licenses.html',
  ])
    writeFileSync(resolve(outDir, file), readFileSync(resolve(root, 'public', file)));
  mkdirSync(resolve(outDir, 'licenses'), { recursive: true });
  for (const file of ['WORDNET-LICENSE.txt', 'ECDICT-LICENSE.txt'])
    writeFileSync(
      resolve(outDir, 'licenses', file),
      readFileSync(resolve(root, 'public/licenses', file)),
    );
  const index = readFileSync(resolve(outDir, 'index.html'), 'utf8')
    .replace('<html lang="zh-CN">', '<html lang="zh-CN" data-mode="pages">')
    .replace(
      '<head>',
      "<head>\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' https:; connect-src 'self' https://api.dictionaryapi.dev; object-src 'none'; base-uri 'self'; form-action 'self'\">",
    );
  writeFileSync(resolve(outDir, 'index.html'), index);
  writeFileSync(resolve(outDir, 'data/vocabulary.json'), json);
  writeFileSync(resolve(outDir, 'data/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(
    resolve(outDir, 'data/lookup-helpers.json'),
    JSON.stringify(
      original
        .filter((w) => isFoundationWord(w.word))
        .map((w) => ({ ...w, source: 'curated', status: 'ready', learningExcluded: true })),
      null,
      2,
    ) + '\n',
  );
  writeFileSync(resolve(outDir, '.nojekyll'), '');
  return {
    source,
    total: data.length,
    omitted: records.filter((w) => !w.archived && !isFoundationWord(w.word)).length - data.length,
    version: manifest.version,
    output: outDir,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const databaseIndex = process.argv.indexOf('--database');
  if (databaseIndex >= 0 && !process.argv[databaseIndex + 1])
    throw new Error('--database 后需指定 SQLite 文件。');
  const databasePath = databaseIndex >= 0 ? resolve(process.argv[databaseIndex + 1]) : undefined;
  if (databasePath && !existsSync(databasePath)) throw new Error('指定的数据库文件不存在。');
  console.log(
    JSON.stringify(
      buildPages({
        useSeed: process.argv.includes('--seed'),
        ...(databasePath ? { databasePath } : {}),
      }),
      null,
      2,
    ),
  );
}

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { seed } from './vocabulary.mjs';
import { seed as originalSeed } from './original-vocabulary.mjs';
import { isFoundationWord } from './learning-policy.mjs';
export function openStore(directory) {
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(join(directory, 'word-atlas.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY, word TEXT NOT NULL UNIQUE, category TEXT NOT NULL, chinese TEXT DEFAULT '', definition TEXT DEFAULT '', example TEXT DEFAULT '', phonetic TEXT DEFAULT '', partOfSpeech TEXT DEFAULT '', audio TEXT DEFAULT '', source TEXT DEFAULT 'manual', status TEXT DEFAULT 'pending', error TEXT DEFAULT '', favorite INTEGER DEFAULT 0, stage INTEGER DEFAULT 0, due TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, word_id INTEGER REFERENCES words(id), rating TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS lookups (word TEXT PRIMARY KEY, data TEXT NOT NULL, created TEXT DEFAULT CURRENT_TIMESTAMP);`);
  if (
    !db
      .prepare('PRAGMA table_info(words)')
      .all()
      .some((column) => column.name === 'archived')
  )
    db.exec('ALTER TABLE words ADD COLUMN archived INTEGER NOT NULL DEFAULT 0');
  const insert = db.prepare(
    `INSERT OR IGNORE INTO words (word,category,chinese,definition,example,phonetic,partOfSpeech,source,status) VALUES (?,?,?,?,?,?,?,?,?)`,
  );
  db.exec('BEGIN');
  try {
    for (const w of seed)
      insert.run(
        w.word,
        w.category,
        w.chinese,
        w.definition,
        w.example,
        w.phonetic || '',
        w.partOfSpeech || 'noun',
        w.source || 'curated',
        'ready',
      );
    // Keep primary keys and foreign-key review history intact during upgrades.
    const archive = db.prepare('UPDATE words SET archived=1 WHERE id=?');
    for (const w of db.prepare('SELECT id,word FROM words WHERE archived=0').all())
      if (isFoundationWord(w.word)) archive.run(w.id);
    // Foundation words remain available when clicking through example sentences.
    const lookup = db.prepare('INSERT OR IGNORE INTO lookups(word,data) VALUES (?,?)');
    for (const w of originalSeed.filter((word) => isFoundationWord(word.word)))
      lookup.run(
        w.word,
        JSON.stringify({ ...w, source: 'curated', status: 'ready', learningExcluded: true }),
      );
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return db;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { openStore } from '../lib/store.mjs';
import { seed as legacySeed } from '../lib/original-vocabulary.mjs';
import { isFoundationWord } from '../lib/learning-policy.mjs';

test('190-entry database upgrades without losing IDs, edits, favorites or review history', () => {
  const directory = mkdtempSync(join(tmpdir(), 'word-atlas-migration-'));
  let db;
  try {
    // Exact pre-upgrade words schema: no archived column.
    db = new DatabaseSync(join(directory, 'word-atlas.sqlite'));
    db.exec(`CREATE TABLE words (id INTEGER PRIMARY KEY, word TEXT NOT NULL UNIQUE, category TEXT NOT NULL, chinese TEXT DEFAULT '', definition TEXT DEFAULT '', example TEXT DEFAULT '', phonetic TEXT DEFAULT '', partOfSpeech TEXT DEFAULT '', audio TEXT DEFAULT '', source TEXT DEFAULT 'manual', status TEXT DEFAULT 'pending', error TEXT DEFAULT '', favorite INTEGER DEFAULT 0, stage INTEGER DEFAULT 0, due TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE reviews (id INTEGER PRIMARY KEY, word_id INTEGER REFERENCES words(id), rating TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);`);
    const insert = db.prepare(
      "INSERT INTO words(word,category,chinese,definition,example,partOfSpeech,source,status) VALUES (?,?,?,?,?,?,'curated','ready')",
    );
    for (const word of legacySeed)
      insert.run(
        word.word,
        word.category,
        word.chinese,
        word.definition,
        word.example,
        word.partOfSpeech,
      );
    const aId = db.prepare("SELECT id FROM words WHERE word='a'").get().id;
    const batteryId = db.prepare("SELECT id FROM words WHERE word='battery'").get().id;
    db.prepare(
      "UPDATE words SET favorite=1, stage=3, due='2030-01-01T00:00:00.000Z' WHERE id IN (?,?)",
    ).run(aId, batteryId);
    db.prepare(
      "UPDATE words SET definition='My verified battery definition.', source='manual' WHERE id=?",
    ).run(batteryId);
    db.prepare("INSERT INTO reviews(word_id,rating) VALUES (?,'good')").run(aId);
    db.prepare("INSERT INTO reviews(word_id,rating) VALUES (?,'good')").run(batteryId);
    db.exec(
      "INSERT INTO words(word,category,source,status) VALUES ('atlasuserterm','energy','manual','needs_review'),('b','daily','manual','pending'),('c','daily','manual','pending'),('d','daily','manual','pending')",
    );
    db.close();

    db = openStore(directory);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM words WHERE archived=0').get().n, 5001);
    const basic = db.prepare("SELECT * FROM words WHERE word='a'").get();
    assert.equal(basic.id, aId);
    assert.equal(basic.archived, 1);
    assert.equal(basic.favorite, 1);
    assert.equal(basic.stage, 3);
    assert.equal(basic.due, '2030-01-01T00:00:00.000Z');
    const battery = db.prepare("SELECT * FROM words WHERE word='battery'").get();
    assert.equal(battery.id, batteryId);
    assert.equal(battery.definition, 'My verified battery definition.');
    assert.equal(battery.source, 'manual');
    assert.equal(battery.favorite, 1);
    assert.equal(battery.stage, 3);
    assert.equal(battery.archived, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reviews').get().n, 2);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
    assert.ok(
      db
        .prepare('SELECT word FROM words WHERE archived=0')
        .all()
        .every((w) => !isFoundationWord(w.word)),
    );
    const count = db.prepare('SELECT COUNT(*) AS n FROM words').get().n;
    db.close();

    db = openStore(directory);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM words').get().n, count);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM words WHERE archived=0').get().n, 5001);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reviews').get().n, 2);
  } finally {
    db?.close();
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep));
    assert.ok(directory.includes('word-atlas-migration-'));
    rmSync(directory, { recursive: true, force: true });
  }
});

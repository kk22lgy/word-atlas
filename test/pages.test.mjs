import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createBrowserAPI } from '../public/browser-api.js';
import { buildPages, publishedData } from '../tools/build-pages.mjs';
import { openStore } from '../lib/store.mjs';

class MemoryStorage {
  data = new Map();
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, value);
  }
}
const makeWord = (word, category = 'energy') => ({
  word,
  category,
  chinese: '示例词义',
  definition: 'A verified definition of ' + word + '.',
  example: 'We discussed ' + word + ' during the review.',
  partOfSpeech: 'noun',
  source: 'manual',
});
function fixture(storage = new MemoryStorage()) {
  let time = new Date('2026-10-10T02:00:00Z');
  let words = [makeWord('battery'), makeWord('itinerary', 'travel'), makeWord('state of charge')];
  let externalCalls = 0;
  const fetchImpl = async (url) => {
    const path = new URL(url).pathname;
    if (path === '/word-atlas/data/vocabulary.json')
      return { ok: true, json: async () => structuredClone(words) };
    if (path === '/word-atlas/data/manifest.json')
      return { ok: true, json: async () => ({ total: words.length, phrases: 1, version: 'test' }) };
    if (path === '/word-atlas/data/lookup-helpers.json')
      return {
        ok: true,
        json: async () => [{ ...makeWord('a', 'daily'), learningExcluded: true }],
      };
    if (String(url).startsWith('https://api.dictionaryapi.dev/')) {
      externalCalls++;
      if (path.endsWith('/unknownfixture')) return { ok: false, status: 404 };
      return {
        ok: true,
        json: async () => [
          {
            word: path.split('/').at(-1),
            meanings: [
              {
                partOfSpeech: 'noun',
                definitions: [
                  {
                    definition: 'An externally verified meaning.',
                    example: 'This dictionaryfixture is used in a sentence.',
                  },
                ],
              },
            ],
          },
        ],
      };
    }
    throw new Error('Unexpected URL: ' + url);
  };
  const create = () =>
    createBrowserAPI({
      storage,
      baseUrl: 'https://kk22lgy.github.io/word-atlas/',
      fetchImpl,
      now: () => time,
    });
  return {
    create,
    storage,
    setWords: (value) => (words = value),
    setTime: (value) => (time = new Date(value)),
    externalCalls: () => externalCalls,
  };
}
test('Pages publishes the complete local vocabulary while excluding personal data and draft entries', () => {
  const directory = mkdtempSync(join(tmpdir(), 'word-atlas-pages-'));
  let db;
  try {
    db = openStore(join(directory, 'database'));
    db.exec(
      "UPDATE words SET favorite=1, stage=4, due='2030-01-01', definition='My edited battery definition.' WHERE word='battery'",
    );
    db.exec(
      "INSERT INTO words(word,category,chinese,definition,example,status,source) VALUES ('publishedfixture','business','发布测试','A completed custom entry.','We use publishedfixture during our meeting.','ready','manual'),('draftfixture','daily','','','','pending','manual')",
    );
    db.close();
    db = null;
    const output = join(directory, 'site');
    const result = buildPages({
      outDir: output,
      databasePath: join(directory, 'database', 'word-atlas.sqlite'),
    });
    assert.equal(result.total, 5001);
    assert.equal(result.omitted, 1);
    const words = JSON.parse(readFileSync(join(output, 'data/vocabulary.json'), 'utf8'));
    assert.equal(
      words.find((w) => w.word === 'battery').definition,
      'My edited battery definition.',
    );
    assert.ok(words.find((w) => w.word === 'publishedfixture'));
    assert.ok(!words.find((w) => w.word === 'draftfixture'));
    for (const w of words)
      for (const key of ['id', 'favorite', 'stage', 'due', 'created', 'error', 'archived'])
        assert.equal(key in w, false);
    assert.match(readFileSync(join(output, 'index.html'), 'utf8'), /data-mode="pages"/);
    assert.match(readFileSync(join(output, 'index.html'), 'utf8'), /src="\.\/app.js"/);
    assert.ok(readFileSync(join(output, 'browser-api.js')).length > 0);
    assert.ok(
      readFileSync(join(output, 'licenses/WORDNET-LICENSE.txt'), 'utf8').includes('Copyright 2011'),
    );
    assert.equal(
      buildPages({ outDir: output, databasePath: join(directory, 'database', 'word-atlas.sqlite') })
        .version,
      result.version,
    );
    const clean = publishedData([
      { ...makeWord('battery'), favorite: 1, stage: 2 },
      makeWord('a'),
      { ...makeWord('hiddenfixture'), archived: 1 },
    ]);
    assert.equal(clean.length, 1);
    assert.equal('favorite' in clean[0], false);
  } finally {
    db?.close();
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep));
    assert.ok(directory.includes('word-atlas-pages-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
test('Pages searches, filters, resolves inflections and foundation words without a server', async () => {
  const f = fixture(),
    api = f.create();
  assert.equal((await api.request('/stats')).total, 3);
  assert.equal((await api.request('/words?category=travel')).length, 1);
  assert.equal((await api.request('/words?q=charge'))[0].word, 'state of charge');
  assert.equal((await api.request('/lookup?word=batteries')).word, 'battery');
  assert.equal((await api.request('/lookup?word=a')).learningExcluded, true);
  assert.equal(f.externalCalls(), 0);
  assert.equal((await api.request('/lookup?word=dictionaryfixture')).source, 'dictionaryapi.dev');
  await api.request('/lookup?word=dictionaryfixture');
  assert.equal(f.externalCalls(), 1);
  await assert.rejects(api.request('/lookup?word=unknownfixture'), /暂未找到/);
  await assert.rejects(api.request('/import', { method: 'POST', body: '{}' }), /本地管理版/);
});
test('Favorites and review scheduling persist by word across reloads and published catalog updates', async () => {
  const f = fixture();
  let api = f.create();
  const battery = await api.request('/lookup?word=battery');
  await api.request('/words/' + battery.id, {
    method: 'PATCH',
    body: JSON.stringify({ favorite: true }),
  });
  const reviewed = await api.request('/words/' + battery.id + '/review', {
    method: 'POST',
    body: JSON.stringify({ rating: 'good' }),
  });
  assert.equal(reviewed.stage, 1);
  assert.equal(reviewed.due, '2026-10-11T02:00:00.000Z');
  assert.equal((await api.request('/stats')).today, 1);
  f.setWords([makeWord('addedfixture'), makeWord('battery'), makeWord('state of charge')]);
  api = f.create();
  const updated = await api.request('/lookup?word=battery');
  assert.notEqual(updated.id, battery.id);
  assert.equal(updated.stage, 1);
  assert.equal(updated.favorite, 1);
  assert.equal((await api.request('/words?filter=favorite')).length, 1);
  f.setTime('2026-10-12T02:00:00Z');
  assert.equal((await api.request('/stats')).today, 0);
  assert.equal((await api.request('/words?filter=review'))[0].word, 'battery');
  const deviceTwo = fixture().create();
  assert.equal((await deviceTwo.request('/stats')).favorites, 0);
});
test('Progress backups restore validated records without altering the published vocabulary', async () => {
  const f = fixture(),
    api = f.create();
  await api.request('/words/1', { method: 'PATCH', body: JSON.stringify({ favorite: true }) });
  const backup = api.exportProgress(),
    other = fixture().create();
  assert.equal(other.importProgress(backup), 1);
  assert.equal((await other.request('/words?filter=favorite'))[0].word, 'battery');
  const broken = JSON.parse(backup);
  broken.progress.battery.stage = 999;
  assert.throws(() => other.importProgress(JSON.stringify(broken)), /格式/);
  assert.equal((await other.request('/stats')).favorites, 1);
  assert.throws(() => other.importProgress('{"words":[]}'), /有效/);
  const exported = JSON.parse(await other.exportWords());
  assert.equal(exported.length, 3);
  assert.equal('favorite' in exported[0], false);
  assert.match(await other.exportWords('csv'), /^\uFEFFword,category/);
});
test('Storage failures are reported instead of claiming progress has been saved', async () => {
  const storage = new MemoryStorage();
  storage.setItem = () => {
    throw new Error('quota');
  };
  const api = fixture(storage).create();
  await assert.rejects(
    api.request('/words/1', { method: 'PATCH', body: JSON.stringify({ favorite: true }) }),
    /未保存/,
  );
  assert.equal((await api.request('/stats')).favorites, 0);
});

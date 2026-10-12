import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { corpus } from '../lib/vocabulary.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
test(
  'API: import → enrich → study → persist, with security checks',
  { timeout: 30000 },
  async (t) => {
    const dir = await mkdtemp(join(tmpdir(), 'word-atlas-test-'));
    let child, base;
    const token = 'test-session-token';
    async function start() {
      child = spawn(
        process.execPath,
        [
          '--import',
          pathToFileURL(resolve(root, 'test/mock-fetch.mjs')).href,
          resolve(root, 'server.mjs'),
        ],
        {
          cwd: root,
          env: {
            ...process.env,
            PORT: '0',
            HOST: '127.0.0.1',
            DATA_DIR: dir,
            APP_TOKEN: token,
            AI_API_KEY: '',
            AI_BASE_URL: '',
            AI_MODEL: '',
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      base = await new Promise((resolve, reject) => {
        let output = '',
          stderr = '';
        const timeout = setTimeout(
          () => reject(new Error('Server startup timed out: ' + stderr)),
          10000,
        );
        child.stderr.on('data', (chunk) => (stderr += chunk));
        child.stdout.on('data', (chunk) => {
          output += chunk;
          const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
          if (match) {
            clearTimeout(timeout);
            resolve(match[0]);
          }
        });
        child.on('error', reject);
        child.on('exit', (code) => {
          clearTimeout(timeout);
          reject(new Error('Server exited: ' + code + ' ' + stderr));
        });
      });
    }
    async function stop() {
      if (child && !child.killed && child.exitCode === null && child.signalCode === null)
        await new Promise((resolve) => {
          child.once('exit', resolve);
          child.kill();
        });
    }
    async function call(path, method = 'GET', data, headers = {}) {
      const response = await fetch(base + path, {
        method,
        signal: AbortSignal.timeout(5000),
        headers: {
          Authorization: 'Bearer ' + token,
          ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      const text = await response.text();
      let value;
      try {
        value = JSON.parse(text);
      } catch {
        value = text;
      }
      return { status: response.status, data: value, headers: response.headers };
    }
    async function settled(word) {
      for (let i = 0; i < 80; i++) {
        const result = await call('/api/words?q=' + word);
        const w = result.data.find((w) => w.word === word);
        if (w && !['pending', 'processing'].includes(w.status)) return w;
        await new Promise((r) => setTimeout(r, 25));
      }
      throw new Error('enrichment did not finish');
    }
    t.after(async () => {
      await stop();
      assert.ok(resolve(dir).startsWith(resolve(tmpdir()) + sep));
      assert.ok(dir.includes('word-atlas-test-'));
      await rm(dir, { recursive: true, force: true });
    });
    await start();
    let customId, batteryId;
    await t.test('seed counts, filtering and local inflected lookup', async () => {
      const stats = await call('/api/stats');
      assert.equal(stats.data.total, 5000);
      assert.equal(
        (await call('/api/words?category=energy')).data.length,
        corpus.categories.energy,
      );
      const result = await call('/api/lookup?word=batteries');
      assert.equal(result.data.word, 'battery');
      batteryId = result.data.id;
    });
    await t.test(
      'foundation words stay out of lists, exports and imports but support sentence lookup',
      async () => {
        const lookup = await call('/api/lookup?word=a');
        assert.equal(lookup.data.word, 'a');
        assert.equal(lookup.data.learningExcluded, true);
        assert.equal((await call('/api/import', 'POST', { entry: { word: 'a' } })).status, 400);
        const preview = await call('/api/import/preview', 'POST', {
          text: 'a\nb\nc\nd',
          filename: 'words.txt',
        });
        assert.equal(preview.data.errors.length, 4);
        const words = (await call('/api/words')).data;
        assert.ok(!words.some((w) => /^[a-z]$/.test(w.word)));
        assert.equal((await call('/api/stats')).data.builtInTotal, 5000);
        assert.equal((await call('/api/stats')).data.pending, 0);
      },
    );
    await t.test('token, CSRF and static files', async () => {
      assert.equal((await fetch(base + '/api/stats')).status, 401);
      assert.equal(
        (
          await call(
            '/api/import',
            'POST',
            { entry: { word: 'atlasinvalidfixture' } },
            { Origin: 'https://untrusted.example' },
          )
        ).status,
        403,
      );
      assert.equal(
        (await call('/api/import', 'POST', {}, { 'Sec-Fetch-Site': 'cross-site' })).status,
        403,
      );
      const response = await fetch(base + '/');
      assert.match(await response.text(), /Word Atlas/);
      assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
      assert.equal((await fetch(base + '/%2e%2e%2fserver.mjs')).status, 403);
    });
    await t.test('preview identifies existing, duplicate and malformed entries', async () => {
      const r = await call('/api/import/preview', 'POST', {
        text: 'battery\natlasfixtureentry\nATLASFIXTUREENTRY\n<script>',
        filename: 'words.txt',
        category: 'energy',
      });
      assert.deepEqual(r.data.existing, ['battery']);
      assert.equal(r.data.duplicates, 1);
      assert.equal(r.data.errors.length, 1);
      assert.equal(
        (
          await call('/api/import', 'POST', {
            text: 'atlasinvalidfixture\n<script>',
            filename: 'words.txt',
          })
        ).status,
        400,
      );
      assert.equal((await call('/api/words?q=atlasinvalidfixture')).data.length, 0);
    });
    await t.test('single word is enriched asynchronously and duplicate skipped', async () => {
      const r = await call('/api/import', 'POST', {
        entry: { word: 'atlasfixtureentry', category: 'business' },
      });
      assert.equal(r.status, 201);
      assert.equal(r.data.pending, 1);
      const w = await settled('atlasfixtureentry');
      assert.equal(w.status, 'ready');
      assert.match(w.example, /atlasfixtureentry/);
      assert.equal(w.source, 'dictionaryapi.dev');
      customId = w.id;
      assert.equal(
        (await call('/api/import', 'POST', { entry: { word: 'ATLASFIXTUREENTRY' } })).data.skipped,
        1,
      );
    });
    await t.test('batch upload, failure states, manual edits and retry', async () => {
      const r = await call('/api/import', 'POST', {
        filename: 'words.csv',
        text: 'word,category,definition,example\natlasfixturebatch,business,The ability to adapt.,Atlasfixturebatch helps our team.\nunrecognizedterm,energy,,\nnetworkfailure,daily,,',
      });
      assert.equal(r.data.added, 3);
      assert.equal((await settled('unrecognizedterm')).status, 'needs_review');
      assert.equal((await settled('networkfailure')).status, 'needs_review');
      const w = (await call('/api/words?q=unrecognizedterm')).data[0];
      const fixed = await call('/api/words/' + w.id, 'PATCH', {
        definition: 'A manually verified technical term.',
        example: 'We documented this unrecognizedterm for review.',
      });
      assert.equal(fixed.data.status, 'ready');
      assert.equal((await call('/api/retry', 'POST', {})).data.queued, 1);
      await settled('networkfailure');
    });
    await t.test('favorites, review scheduling and unknown-word cache', async () => {
      assert.equal(
        (await call('/api/words/' + customId, 'PATCH', { favorite: true })).data.favorite,
        1,
      );
      assert.equal((await call('/api/words?filter=favorite')).data.length, 1);
      const r = await call('/api/words/' + customId + '/review', 'POST', { rating: 'good' });
      assert.equal(r.data.stage, 1);
      assert.ok(Date.parse(r.data.due) > Date.now());
      assert.equal((await call('/api/stats')).data.today, 1);
      assert.equal(
        (await call('/api/words/' + batteryId + '/review', 'POST', { rating: 'again' })).data.stage,
        0,
      );
      const db = new DatabaseSync(join(dir, 'word-atlas.sqlite'));
      db.prepare('UPDATE words SET due=? WHERE id=?').run('2000-01-01T00:00:00.000Z', batteryId);
      db.close();
      assert.equal(
        (await call('/api/words?filter=review')).data.some((w) => w.id === batteryId),
        true,
      );
      assert.equal((await call('/api/stats')).data.due, 1);
      assert.equal(
        (await call('/api/lookup?word=dictionaryfixturelookup')).data.source,
        'dictionaryapi.dev',
      );
    });
    await t.test('CSV and JSON exports preserve learning materials', async () => {
      const csv = await call('/api/export?format=csv');
      assert.match(csv.data, /atlasfixtureentry/);
      assert.match(csv.headers.get('content-type'), /text\/csv/);
      const json = await call('/api/export');
      assert.equal(json.data.length, 5004);
      assert.ok(json.data.find((w) => w.word === 'atlasfixtureentry').definition);
    });
    await t.test('data and learning progress survive server restart', async () => {
      await stop();
      await start();
      const w = (await call('/api/words?q=atlasfixtureentry')).data[0];
      assert.equal(w.stage, 1);
      assert.equal(w.favorite, 1);
      assert.equal(w.id, customId);
      assert.equal((await call('/api/stats')).data.total, 5004);
    });
  },
);

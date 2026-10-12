import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEntry, parseImport, parseDelimited } from '../lib/import.mjs';
import { wordCandidates } from '../lib/enrich.mjs';
import { seed, corpus } from '../lib/vocabulary.mjs';
import { isFoundationWord } from '../lib/learning-policy.mjs';
test('5000 unique words cover all four domains with complete learning material', () => {
  assert.equal(seed.length, 5000);
  assert.equal(new Set(seed.map((w) => w.word)).size, 5000);
  for (const c of ['daily', 'travel', 'business', 'energy'])
    assert.ok(seed.filter((w) => w.category === c).length >= 40);
  for (const w of seed) {
    assert.ok(w.chinese && w.definition && w.example && w.partOfSpeech, w.word);
    assert.equal(isFoundationWord(w.word), false, w.word);
    assert.ok(['curated', 'authored', 'wordnet-ecdict'].includes(w.source), w.word);
    assert.ok(w.example.toLowerCase().includes(w.word.toLowerCase()), w.word);
  }
  assert.equal(corpus.total, seed.length);
  assert.equal(corpus.phrases, seed.filter((w) => /[ -]/.test(w.word)).length);
  assert.ok(corpus.phrases >= 1000);
  for (const [category, count] of Object.entries(corpus.categories))
    assert.equal(seed.filter((w) => w.category === category).length, count);
});
test('CSV handles BOM, quoted commas, escaped quotes and multiline examples', () => {
  const value =
    '\uFEFFword,category,definition,example\r\nresilience,business,"Recover, adapt","She said ""hello"".\nThen continued."';
  const result = parseImport(value, 'words.csv');
  assert.equal(result.errors.length, 0);
  assert.equal(result.entries[0].definition, 'Recover, adapt');
  assert.equal(result.entries[0].example, 'She said "hello".\nThen continued.');
});
test('TXT deduplicates case and whitespace and retains phrases', () => {
  const result = parseImport(' Battery \nBATTERY\nthermal   management\n', 'words.txt', 'energy');
  assert.equal(result.entries.length, 2);
  assert.equal(result.duplicates, 1);
  assert.equal(result.entries[1].word, 'thermal management');
  assert.equal(result.entries[1].category, 'energy');
});
test('Chinese header aliases, categories and TSV are supported', () => {
  const result = parseImport(
    '单词\t分类\t英文解释\t英文例句\nresilience\t商业工作\tRecovery from difficulty.\tResilience helps us.',
    'words.tsv',
  );
  assert.equal(result.entries[0].category, 'business');
  assert.equal(result.entries[0].definition, 'Recovery from difficulty.');
});
test('JSON strings, arrays and words wrapper are supported', () => {
  assert.equal(parseImport('["receipt",{"word":"visa"}]', 'words.json').entries.length, 2);
  assert.equal(parseImport('{"words":["itinerary"]}', 'words.json').entries[0].word, 'itinerary');
});
test('malformed rows are rejected without silently importing them', () => {
  assert.throws(() => parseImport('word,example\n"unfinished', 'words.csv'), /引号/);
  assert.throws(() => parseImport('wrong,header\nfoo,bar', 'words.csv'), /word/);
  assert.throws(() => parseImport('{}', 'words.json'), /JSON/);
  assert.equal(parseImport('resilience\n<script>', 'words.txt').errors.length, 1);
  assert.throws(() => normalizeEntry({ word: 'resilience', category: 'unknown' }), /分类/);
  assert.throws(() => parseImport(Array(2001).fill('hello').join('\n'), 'words.txt'), /2,000/);
  assert.throws(() => parseImport('', 'words.txt'), /没有/);
});
test('word forms resolve common plurals, verbs and irregular words', () => {
  assert.ok(wordCandidates('batteries').includes('battery'));
  assert.ok(wordCandidates('running').includes('run'));
  assert.ok(wordCandidates('bought').includes('buy'));
  assert.ok(wordCandidates('charging').includes('charge'));
});

test('foundation entries are rejected but meaningful abbreviations and phrases remain', () => {
  for (const word of ['a', 'B', 'c', 'd', 'z', 'the', 'and', 'hello', 'one', 'quick'])
    assert.throws(() => normalizeEntry({ word }), /基础/);
  for (const word of ['AC', 'DC', 'SOC', 'a free upgrade', 'state of charge'])
    assert.equal(normalizeEntry({ word }).word, word.toLowerCase());
  const result = parseImport('a\nb\nc\nd\nbattery', 'words.txt');
  assert.equal(result.errors.length, 4);
  assert.deepEqual(
    result.entries.map((w) => w.word),
    ['battery'],
  );
});

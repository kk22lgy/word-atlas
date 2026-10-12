/** Reproducible offline assembly; source downloads are never runtime dependencies. */
import { readFileSync, writeFileSync, mkdirSync, createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseDelimited } from '../lib/import.mjs';
import { seed as original } from '../lib/original-vocabulary.mjs';
import { isFoundationWord } from '../lib/learning-policy.mjs';
import { authoredCollocations } from './authored-collocations.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ecdictPath = resolve(root, 'tools/cache/ecdict-package/package/assets/ecdict.csv');
const wordnetPath = resolve(root, 'tools/cache/package/dict');
const bilingual = new Map();
let rowsRead = 0;
const lines = createInterface({
  input: createReadStream(ecdictPath, { encoding: 'utf8' }),
  crlfDelay: Infinity,
});
for await (const line of lines) {
  if (!rowsRead++) {
    continue;
  }
  let row;
  try {
    row = parseDelimited(line)[0];
  } catch {
    continue;
  }
  if (!row || row.length < 10) continue;
  const [word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq] = row;
  if (
    !/^[a-z][a-z '-]{3,45}$/.test(word) ||
    isFoundationWord(word) ||
    !/[\u4e00-\u9fff]/.test(translation)
  )
    continue;
  const ranks = [Number(bnc), Number(frq)].filter((x) => x > 0);
  const rank = ranks.length ? Math.min(...ranks) : 50000;
  if (!word.includes(' ') && rank < 1200) continue;
  if (rank > 30000 && !word.includes(' ') && Number(collins) < 1 && !tag.includes('cet')) continue;
  bilingual.set(word, {
    translation: translation.replaceAll('\\n', '\n'),
    rank,
    collins: Number(collins),
    oxford: Number(oxford),
    tag,
  });
}
// WordNet offsets in index.* are ordered by sense frequency. Never select an
// obscure sense just because it happens to have a convenient example sentence.
const primarySenses = new Map();
for (const file of ['noun', 'verb', 'adj', 'adv']) {
  for (const line of readFileSync(resolve(wordnetPath, 'index.' + file), 'utf8').split('\n')) {
    if (!line || /^\s/.test(line)) continue;
    const fields = line.trim().split(/\s+/);
    const pointerCount = Number(fields[3]);
    primarySenses.set(`${file}:${fields[0].replaceAll('_', ' ')}`, fields[6 + pointerCount]);
  }
}
const taboo =
  /\b(obsolete|archaic|offensive|vulgar|slang term|racial|racist|sexual|sexually|prostitute|prostitution|pornograph\w*|genital\w*|penis|vagina|rape|raped|murder\w*|suicide|kill\w*|nazi|negro\w*|nigger\w*|asshole|bastard|shit|fuck\w*|damn\w*|terror\w*|warfare|weapon\w*|ammunition|military|army|navy|naval|regiment|cavalry|battalion|gun|guns|bomb|bombs|bombing)\b/i;
const domainTerms = {
  energy:
    /\b(battery|batteries|electr\w*|voltage|current|power|energy|thermal|temperature|heat|resistance|conduct\w*|insulat\w*|chemical|chemistry|electrode|electrolyt\w*|ion|ionic|lithium|capacitor|circuit|transformer|inverter|renewable|solar|wind turbine|generator|generation|watt|ampere|ohm|impedance|magnetic|magnetism|photovoltaic|semiconductor|coolant|cooling|combustion|oxidation|oxidize|reduction reaction|recharge\w*|discharge|grid|kilowatt|megawatt|storage tank|dielectric|transistor|rectifier|electrochem\w*)\b/gi,
  travel:
    /\b(travel\w*|tourist\w*|tourism|touring|journey|trip|voyage|itinerary|hotel|hostel|airport|airline|airplane|aircraft|aviation|railway|railroad|train|ticket|passport|visa|baggage|luggage|passenger|flight|cruise|ferry|harbor|harbour|port|ship|boat|sail\w*|coast|beach|island|mountain|hiking|hike|camping|campground|campsite|museum|gallery|restaurant|cafe|restaurant|cuisine|reservation|accommodation|sightseeing|scenic|landscape|destination|departure|arrival|arrive|depart|route|transit|transport\w*|vehicle|bus|taxi|station|subway|underground railway|road|highway|traffic|bridge|tunnel|border|foreign country|abroad|overseas|geographic\w*|map|navigation|navigate|pedestrian|pedal|bicycle|cycling|weather|rainfall|snowfall|climate|festival|souvenir|hospitality)\b/gi,
  business:
    /\b(business|commercial|commerce|market\w*|corporat\w*|company|companies|firm|organization|office|workplace|employ\w*|staff|personnel|workforce|salary|wage\w*|payroll|career|professional|profession|manager|management|manage|executive|leadership|meeting|agenda|negotiat\w*|contract\w*|agreement|proposal|tender|bid|procure\w*|purchas\w*|invoice|payment|accounting|accountant|audit\w*|budget\w*|financial|finance|revenue|profit\w*|expense\w*|economic\w*|invest\w*|stock market|shareholder|stakeholder|capital|loan|credit|debt|bank|banking|tax|insurance|policy|customer|client|consumer|sales|sell|selling|sale|buy|buyer|buying|supplier|supply chain|inventory|manufactur\w*|production|products|delivery|shipment|warehouse|logistic\w*|exports?|exporting|exported|exporter|imports?|importing|imported|importer|wholesale|retail\w*|entrepreneur\w*|enterprise|startup|project|deadline|milestone|schedule|strategy|strategic|objective|target|performance|efficiency|compliance|regulation|regulatory|legal|legislation|liability|license|licence|copyright|patent|trademark|communication|communicat\w*|report|presentation|document|memo|collaborat\w*|coordinat\w*|consult\w*|recruit\w*|training|promotion|promote|supervis\w*|superior|subordinate|transaction|distribution|demand|competition|competitive|competitor|productivity)\b/gi,
};
function classify(word, definition, example, lex) {
  const text = `${definition} ${example}`;
  const scores = Object.fromEntries(
    Object.entries(domainTerms).map(([domain, regex]) => [
      domain,
      [...text.matchAll(regex)].length,
    ]),
  );
  // Electrical terms must be literal, not metaphorical power/current/charge.
  if (
    /\b(batter(?:y|ies)|electrical|electric current|electricity|voltage|electrode|electrolyte|lithium|capacitor|inverter|kilowatt|megawatt|ampere|ohm|impedance|photovoltaic|semiconductor|transistor|rectifier|electrochemical|thermodynamics)\b/i.test(
      definition,
    ) &&
    [6, 19, 22, 23, 27, 30].includes(lex)
  )
    return 'energy';
  if (
    /\b(travel|journey|tourism|tourist|hotel|airport|airline|railway|railroad|passenger|luggage|baggage|passport|cruise|taxi|subway|accommodation|reservation|booking)\b/i.test(
      definition,
    )
  )
    return 'travel';
  if (
    /\b(linguistics|grammar|grammatical|biological|biology|chemical|chemistry|physiology|mathematics|algebra|geometry|religion|religious|god|church|christian|political|government)\b/i.test(
      definition,
    )
  )
    return 'daily';
  // Broad ambiguous words such as "contract", "train", and "border" do not
  // establish a domain by themselves.
  if (
    !/\b(travel|tourist|journey|hotel|airport|railway|aircraft|transportation|beach|island|mountain|museum|restaurant|cuisine|accommodation|sightseeing|vehicle|highway|bicycle|weather|climate|geographical)\b/i.test(
      text,
    )
  )
    scores.travel = 0;
  if (
    !/\b(business|commercial|commerce|company|companies|corporation|organization|office|employee|employment|staff|salary|wage|manager|management|financial|finance|revenue|profit|accounting|payment|invoice|budget|economic|investment|customer|client|sales|supplier|inventory|manufacturing|shipment|warehouse|enterprise|project|deadline|negotiation|agreement|legal|law|transaction|productivity|workplace)\b/i.test(
      text,
    )
  )
    scores.business = 0;
  if (scores.travel > scores.business && scores.travel > 0) return 'travel';
  if (scores.business > 0) return 'business';
  if (scores.travel > 0) return 'travel';
  return 'daily';
}
const candidates = new Map();
for (const [file, pos] of [
  ['noun', 'noun'],
  ['verb', 'verb'],
  ['adj', 'adjective'],
  ['adv', 'adverb'],
]) {
  for (const line of readFileSync(resolve(wordnetPath, 'data.' + file), 'utf8').split('\n')) {
    if (!/^\d/.test(line)) continue;
    const split = line.indexOf('|');
    if (split < 0) continue;
    const fields = line.slice(0, split).trim().split(/\s+/);
    const lex = Number(fields[1]);
    const count = parseInt(fields[3], 16);
    const gloss = line.slice(split + 1).trim();
    const definition = gloss.split(/;\s*"/)[0].replace(/;\s*$/, '').trim();
    if (taboo.test(gloss) || definition.length < 15 || definition.length > 350) continue;
    const examples = [...gloss.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    if (!examples.length) continue;
    for (let i = 0; i < count; i++) {
      const word = fields[4 + i * 2]
        .replace(/\([a-z]+\)$/, '')
        .replaceAll('_', ' ')
        .toLowerCase();
      const zh = bilingual.get(word);
      if (!zh || word.length < 4 || isFoundationWord(word) || taboo.test(word)) continue;
      if (primarySenses.get(`${file}:${word}`) !== fields[0]) continue;
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
      const example = examples.find(
        (e) => pattern.test(e) && e.split(/\s+/).length >= 6 && e.length <= 230 && !/[<>]/.test(e),
      );
      if (!example) continue;
      // Exclude narrow taxonomic and religious senses from a practical study collection.
      if (
        /\b(genus|species|family of birds|family of mammals|doctrine|deity|divinity|quibble|captious|menstruation|uterus|semen)\b/i.test(
          definition,
        )
      )
        continue;
      const category = classify(word, definition, example, lex);
      const punctuation = /[.!?]$/.test(example) ? '' : '.';
      const chinese = zh.translation
        .split('\n')
        .filter((x) => !/^\[/.test(x))
        .slice(0, 3)
        .join('；');
      if (!/[\u4e00-\u9fff]/.test(chinese)) continue;
      const preferredPOS = zh.translation.startsWith('n.')
        ? 'noun'
        : zh.translation.startsWith('v')
          ? 'verb'
          : zh.translation.startsWith('adv.')
            ? 'adverb'
            : zh.translation.startsWith('a.') || zh.translation.startsWith('adj.')
              ? 'adjective'
              : '';
      const score =
        100000 -
        zh.rank +
        zh.collins * 500 +
        (zh.oxford ? 300 : 0) +
        (word.includes(' ') ? 800 : 0) +
        (pos === preferredPOS ? 2000 : 0);
      const entry = {
        word,
        chinese,
        definition: definition[0].toUpperCase() + definition.slice(1).replace(/[.;]$/, '') + '.',
        example: example[0].toUpperCase() + example.slice(1) + punctuation,
        partOfSpeech: pos,
        category,
        source: 'wordnet-ecdict',
        score,
      };
      if (!candidates.has(word) || candidates.get(word).score < score) candidates.set(word, entry);
    }
  }
}
const chosen = new Map();
for (const w of [
  ...original.filter((w) => !isFoundationWord(w.word)).map((w) => ({ ...w, source: 'curated' })),
  ...authoredCollocations(),
]) {
  w.word = w.word.toLowerCase();
  if (!chosen.has(w.word)) chosen.set(w.word, w);
}
const ranked = [...candidates.values()].sort(
  (a, b) => b.score - a.score || a.word.localeCompare(b.word, 'en'),
);
const eligible = ranked.filter((w) => !chosen.has(w.word));
const summary = {
  bilingual: bilingual.size,
  eligible: eligible.length,
  authored: chosen.size,
  available: chosen.size + eligible.length,
  categories: Object.fromEntries(
    ['daily', 'travel', 'business', 'energy'].map((c) => [
      c,
      eligible.filter((w) => w.category === c).length,
    ]),
  ),
};
console.log(JSON.stringify(summary));
writeFileSync(resolve(root, 'tools/cache/candidates.json'), JSON.stringify(eligible, null, 2));
if (summary.available < 5000)
  throw new Error(
    `Only ${summary.available} complete candidates; expand the authored list before building.`,
  );
// Quotas are upper targets; all entries have a genuine matching example sentence.
const targets = { daily: 1800, travel: 950, business: 1650, energy: 600 };
for (const c of ['energy', 'travel', 'business', 'daily']) {
  const current = [...chosen.values()].filter((w) => w.category === c).length;
  for (const w of eligible
    .filter((w) => w.category === c)
    .slice(0, Math.max(0, targets[c] - current)))
    chosen.set(w.word, w);
}
for (const w of eligible) {
  if (chosen.size >= 5000) break;
  if (!chosen.has(w.word)) chosen.set(w.word, w);
}
const result = [...chosen.values()].slice(0, 5000).map(({ score, ...w }) => w);
if (result.length !== 5000 || new Set(result.map((w) => w.word)).size !== 5000)
  throw new Error('Invalid final count');
for (const w of result)
  if (!w.definition || !w.example || !w.chinese || isFoundationWord(w.word))
    throw new Error(`Invalid entry: ${w.word}`);
const out = resolve(root, 'lib/data');
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'core-5000.json'), JSON.stringify(result, null, 2) + '\n');
writeFileSync(
  resolve(out, 'manifest.json'),
  JSON.stringify(
    {
      version: '2026-10-10.5000',
      total: result.length,
      phrases: result.filter((w) => /[ -]/.test(w.word)).length,
      categories: Object.fromEntries(
        Object.keys(targets).map((c) => [c, result.filter((w) => w.category === c).length]),
      ),
      sources: [
        {
          id: 'wordnet-ecdict',
          definitionAndExamples: 'WordNet 3.1 (wordnet-db 3.1.14)',
          translation: 'ECDICT (ecdict 0.0.4)',
          wordnetUrl: 'https://wordnet.princeton.edu/',
          ecdictUrl: 'https://github.com/skywind3000/ECDICT',
          wordnetDataSHA256: createHash('sha256')
            .update(readFileSync(resolve(root, 'tools/cache/wordnet-db-3.1.14.tgz')))
            .digest('hex'),
          ecdictDataSHA256: createHash('sha256').update(readFileSync(ecdictPath)).digest('hex'),
        },
        { id: 'curated', description: 'Original Word Atlas learning material' },
        {
          id: 'authored',
          description: 'Original domain-specific concepts and explicitly selected collocations',
        },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    built: result.length,
    phrases: result.filter((w) => /[ -]/.test(w.word)).length,
    categories: Object.fromEntries(
      Object.keys(targets).map((c) => [c, result.filter((w) => w.category === c).length]),
    ),
  }),
);

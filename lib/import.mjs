import { isFoundationWord } from './learning-policy.mjs';
export const categories = ['daily', 'travel', 'business', 'energy'];
const aliases = {
  日常生活: 'daily',
  全球旅游: 'travel',
  商业工作: 'business',
  电池储能: 'energy',
  电池储能专业: 'energy',
};
const fields = {
  word: ['word', 'term', '单词', '词汇'],
  definition: ['definition', 'meaning', '英文解释', '英文释义'],
  example: ['example', 'sentence', '英文例句', '例句'],
  chinese: ['chinese', 'translation', '中文', '中文释义'],
  category: ['category', '分类', '领域'],
  phonetic: ['phonetic', 'ipa', '音标'],
  partOfSpeech: ['partofspeech', 'pos', '词性'],
};
export function normalizeWord(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
export function normalizeEntry(input, fallback = 'daily') {
  if (typeof input === 'string') input = { word: input };
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('词条必须是单词或对象');
  const keys = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k.toLowerCase().trim(), v]),
  );
  const out = {};
  for (const [field, names] of Object.entries(fields))
    out[field] = String(names.map((k) => keys[k]).find((v) => v != null) ?? '').trim();
  out.word = normalizeWord(out.word);
  if (!out.word || out.word.length > 120 || !/^[a-z][a-z0-9 '\-()./]*$/i.test(out.word))
    throw new Error('单词需为 1–120 个英文字符，可含空格、数字和连字符');
  if (isFoundationWord(out.word))
    throw new Error('基础独立词条已从学习词库排除，仍可在例句中点击查义');
  out.category = aliases[out.category] || out.category || fallback;
  if (!categories.includes(out.category))
    throw new Error('分类须为 daily / travel / business / energy 或对应中文名称');
  for (const k of ['definition', 'example', 'chinese', 'phonetic', 'partOfSpeech'])
    if (out[k].length > 4000) throw new Error(`${k} 内容过长`);
  return out;
}
export function parseDelimited(text, separator = ',') {
  const rows = [];
  let row = [],
    cell = '',
    quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || !cell) quoted = !quoted;
      else cell += c;
    } else if (c === separator && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (quoted) throw new Error('CSV 引号未闭合');
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function parseImport(text, filename = 'words.txt', fallback = 'daily') {
  let input;
  if (filename.toLowerCase().endsWith('.json')) {
    const data = JSON.parse(text);
    input = Array.isArray(data) ? data : data.words;
    if (!Array.isArray(input)) throw new Error('JSON 必须为词条数组或 {"words": [...]}');
  } else if (/\.(csv|tsv)$/i.test(filename)) {
    const rows = parseDelimited(text, /\.tsv$/i.test(filename) ? '\t' : ',');
    const headers = (rows[0] || []).map((x) => x.trim().toLowerCase());
    if (!headers.some((x) => fields.word.includes(x)))
      throw new Error('表格须包含 word 或 单词 列');
    input = rows
      .slice(1)
      .map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] || ''])));
  } else
    input = text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
  if (input.length > 2000) throw new Error('每批最多导入 2,000 个词条');
  if (!input.length) throw new Error('没有找到可导入的词条');
  const entries = [],
    errors = [],
    seen = new Set();
  let duplicates = 0;
  input.forEach((item, i) => {
    try {
      const entry = normalizeEntry(item, fallback);
      if (seen.has(entry.word)) {
        duplicates++;
        return;
      }
      seen.add(entry.word);
      entries.push(entry);
    } catch (e) {
      errors.push({ row: i + 1, message: e.message });
    }
  });
  return { entries, errors, duplicates, total: input.length };
}

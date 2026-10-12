import { wordCandidates } from './word-forms.js';
import { isFoundationWord } from './learning-policy.js';

const day = (date) => new Date(new Date(date).getTime() + 8 * 3600000).toISOString().slice(0, 10);
const categories = ['daily', 'travel', 'business', 'energy'];
const validWord = (word) => typeof word === 'string' && /^[a-z][a-z0-9 '\-()./]{0,119}$/.test(word);

// Published vocabulary is shared; only personal progress is written locally.
export function createBrowserAPI({
  baseUrl = new URL('./', import.meta.url),
  storage = globalThis.localStorage,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
} = {}) {
  const key = 'word-atlas-progress:' + new URL(baseUrl).pathname;
  let catalogPromise;
  const lookupCache = new Map();
  function readProgress() {
    try {
      return new Map(Object.entries(JSON.parse(storage.getItem(key) || '{}')));
    } catch {
      throw new Error('无法读取本机学习记录，请检查浏览器存储权限。');
    }
  }
  function saveProgress(progress) {
    try {
      storage.setItem(key, JSON.stringify(Object.fromEntries(progress)));
    } catch {
      throw new Error('学习记录未保存：浏览器存储不可用或空间不足。请先备份记录。');
    }
  }
  async function catalog() {
    if (!catalogPromise) {
      catalogPromise = Promise.all(
        ['vocabulary.json', 'manifest.json', 'lookup-helpers.json'].map(async (file) => {
          const response = await fetchImpl(new URL('data/' + file, baseUrl), { cache: 'no-store' });
          if (!response.ok) throw new Error('发布词库加载失败，请刷新页面或检查上传文件是否完整。');
          return response.json();
        }),
      )
        .then(([data, manifest, helpers]) => {
          if (!Array.isArray(data) || !data.length || data.length !== manifest.total)
            throw new Error('发布词库与版本信息不一致，请重新上传整个 docs 文件夹。');
          const words = data
            .filter((w) => !isFoundationWord(w.word))
            .map((w, i) => ({ ...w, id: i + 1, status: 'ready' }));
          return { words, manifest, helpers: new Map(helpers.map((w) => [w.word, w])) };
        })
        .catch((error) => {
          catalogPromise = null;
          throw error;
        });
    }
    return catalogPromise;
  }
  function withProgress(word, progress) {
    return { ...word, favorite: 0, stage: 0, due: null, ...(progress.get(word.word) || {}) };
  }
  async function dictionary(word) {
    if (lookupCache.has(word)) return lookupCache.get(word);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetchImpl(
        'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word),
        { signal: controller.signal },
      );
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('在线词典暂时不可用。');
      const entries = await response.json();
      const definitions = entries.flatMap((e) =>
        (e.meanings || []).flatMap((m) =>
          (m.definitions || []).map((d) => ({ ...d, partOfSpeech: m.partOfSpeech })),
        ),
      );
      const best = definitions.find((d) => d.example) || definitions[0];
      if (!best) return null;
      const phonetics = entries.flatMap((e) => e.phonetics || []);
      const result = {
        word: entries[0].word,
        definition: best.definition,
        example: best.example || '',
        partOfSpeech: best.partOfSpeech,
        phonetic: entries[0].phonetic || phonetics.find((p) => p.text)?.text || '',
        audio: phonetics.find((p) => /-us\./i.test(p.audio))?.audio || '',
        source: 'dictionaryapi.dev',
        status: best.example ? 'ready' : 'needs_review',
        category: 'daily',
        meanings: definitions.slice(0, 6),
        learningExcluded: isFoundationWord(entries[0].word),
      };
      lookupCache.set(word, result);
      return result;
    } catch (error) {
      throw new Error(
        error.name === 'AbortError'
          ? '在线查词超时，请检查网络。'
          : '在线查词失败，请检查网络；已发布词库仍可正常查阅。',
      );
    } finally {
      clearTimeout(timer);
    }
  }
  async function request(path, options = {}) {
    const { words, manifest, helpers } = await catalog();
    const progress = readProgress();
    const all = words.map((w) => withProgress(w, progress));
    const url = new URL(path, 'https://local.invalid');
    const method = options.method || 'GET';
    if (url.pathname === '/stats')
      return {
        total: all.length,
        builtInTotal: all.length,
        builtInPhrases: manifest.phrases,
        publishedVersion: manifest.version,
        categories: categories.map((category) => ({
          category,
          count: all.filter((w) => w.category === category).length,
          learned: all.filter((w) => w.category === category && w.stage > 0).length,
        })),
        learned: all.filter((w) => w.stage > 0).length,
        favorites: all.filter((w) => w.favorite).length,
        due: all.filter((w) => w.due && w.due <= now().toISOString()).length,
        today: all.filter((w) => w.lastReviewed && day(w.lastReviewed) === day(now())).length,
        pending: 0,
        needsReview: 0,
        aiConfigured: false,
        storageMode: 'browser',
      };
    if (url.pathname === '/words' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      return all
        .filter((w) => {
          if (url.searchParams.get('category') && w.category !== url.searchParams.get('category'))
            return false;
          if (url.searchParams.get('status') && w.status !== url.searchParams.get('status'))
            return false;
          if (q && !`${w.word} ${w.chinese} ${w.definition}`.toLowerCase().includes(q))
            return false;
          switch (url.searchParams.get('filter')) {
            case 'favorite':
              return !!w.favorite;
            case 'new':
              return w.stage === 0;
            case 'learned':
              return w.stage > 0;
            case 'review':
              return !!w.due && w.due <= now().toISOString();
            case 'incomplete':
              return false;
            default:
              return true;
          }
        })
        .sort((a, b) => a.word.localeCompare(b.word, 'en'));
    }
    if (url.pathname === '/lookup') {
      const word = String(url.searchParams.get('word') || '')
        .trim()
        .toLowerCase();
      if (!validWord(word)) throw new Error('请输入有效英文单词。');
      const candidates = wordCandidates(word);
      for (const candidate of candidates) {
        const found = all.find((w) => w.word === candidate) || helpers.get(candidate);
        if (found)
          return { ...found, queriedWord: word, learningExcluded: isFoundationWord(found.word) };
      }
      for (const candidate of candidates.slice(0, 3)) {
        const found = await dictionary(candidate);
        if (found) return { ...found, queriedWord: word };
      }
      throw new Error('暂未找到该词，可在本地管理版补充后统一发布。');
    }
    const match = url.pathname.match(/^\/words\/(\d+)(\/review)?$/);
    if (match) {
      const word = all.find((w) => w.id === Number(match[1]));
      if (!word) throw new Error('词条不存在。');
      const body = JSON.parse(options.body || '{}');
      const record = { ...progress.get(word.word) };
      if (method === 'PATCH' && !match[2] && Object.keys(body).length === 1 && 'favorite' in body)
        record.favorite = body.favorite ? 1 : 0;
      else if (method === 'POST' && match[2]) {
        if (!['again', 'good', 'easy'].includes(body.rating)) throw new Error('无效复习评分。');
        record.stage =
          body.rating === 'again' ? 0 : Math.min(word.stage + (body.rating === 'easy' ? 2 : 1), 7);
        const days = [0, 1, 3, 7, 14, 30, 60, 120][record.stage];
        record.due = new Date(now().getTime() + (days ? days * 86400000 : 600000)).toISOString();
        record.lastReviewed = now().toISOString();
      } else throw new Error('词汇资料请在本地管理版更新后统一发布。');
      progress.set(word.word, record);
      saveProgress(progress);
      return withProgress(word, progress);
    }
    throw new Error('词汇请在本地管理版导入、补全后统一发布。');
  }
  async function exportWords(format = 'json') {
    const { words } = await catalog();
    const fields = [
      'word',
      'category',
      'chinese',
      'definition',
      'example',
      'phonetic',
      'partOfSpeech',
    ];
    const data = words.map((w) => Object.fromEntries(fields.map((key) => [key, w[key] || ''])));
    if (format !== 'csv') return JSON.stringify(data, null, 2);
    const quote = (value) =>
      '"' +
      String(value)
        .replace(/^[=+@\t\r]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    return (
      '\uFEFF' +
      [fields.join(','), ...data.map((w) => fields.map((key) => quote(w[key])).join(','))].join(
        '\r\n',
      )
    );
  }
  function exportProgress() {
    return JSON.stringify(
      {
        type: 'word-atlas-progress',
        version: 1,
        exported: now().toISOString(),
        progress: Object.fromEntries(readProgress()),
      },
      null,
      2,
    );
  }
  function importProgress(text) {
    const backup = JSON.parse(text);
    if (
      backup.type !== 'word-atlas-progress' ||
      backup.version !== 1 ||
      !backup.progress ||
      Array.isArray(backup.progress) ||
      typeof backup.progress !== 'object'
    )
      throw new Error('不是有效的 Word Atlas 学习记录备份。');
    const entries = Object.entries(backup.progress);
    if (entries.length > 50000) throw new Error('备份记录过多。');
    const restored = new Map();
    for (const [word, value] of entries) {
      if (
        !validWord(word) ||
        isFoundationWord(word) ||
        !value ||
        typeof value !== 'object' ||
        ![0, 1].includes(value.favorite ?? 0) ||
        !Number.isInteger(value.stage ?? 0) ||
        (value.stage ?? 0) < 0 ||
        (value.stage ?? 0) > 7
      )
        throw new Error('备份中的学习记录格式有误。');
      for (const field of ['due', 'lastReviewed'])
        if (value[field] != null && !Number.isFinite(Date.parse(value[field])))
          throw new Error('备份中的日期无效。');
      restored.set(word, {
        favorite: value.favorite || 0,
        stage: value.stage || 0,
        due: value.due || null,
        lastReviewed: value.lastReviewed || null,
      });
    }
    const merged = readProgress();
    for (const [word, value] of restored) merged.set(word, value);
    saveProgress(merged);
    return restored.size;
  }
  return { request, exportWords, exportProgress, importProgress };
}

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { openStore } from './lib/store.mjs';
import { normalizeEntry, parseImport, normalizeWord } from './lib/import.mjs';
import { dictionary, makeEnricher, wordCandidates } from './lib/enrich.mjs';
import { isFoundationWord } from './lib/learning-policy.mjs';
import { corpus } from './lib/vocabulary.mjs';
const root = dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '127.0.0.1',
  port = Number(process.env.PORT || 3210);
if (!['localhost', '127.0.0.1', '::1'].includes(host) && !process.env.APP_TOKEN)
  throw new Error('对外监听需设置 APP_TOKEN，或使用默认本地 HOST。');
const db = openStore(resolve(root, process.env.DATA_DIR || 'data'));
const enrich = makeEnricher(db);
setImmediate(enrich);
function send(res, status, value, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(typeof value === 'string' ? value : JSON.stringify(value));
}
function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}
async function body(req) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 2 * 1024 * 1024) fail(413, '上传内容不能超过 2 MB');
    chunks.push(c);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    fail(400, '请求内容必须是有效 JSON');
  }
}
const getWord = (id) => {
  const word = db.prepare('SELECT * FROM words WHERE id=?').get(id);
  if (!word) fail(404, '词条不存在');
  return word;
};
function requireAuth(req) {
  if (!process.env.APP_TOKEN) return;
  const actual = Buffer.from(req.headers.authorization || ''),
    expected = Buffer.from(`Bearer ${process.env.APP_TOKEN}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    fail(401, '请输入服务访问令牌');
}
export const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    if (path.startsWith('/api/')) {
      requireAuth(req);
      if (req.method !== 'GET') {
        if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, '不接受跨站写入');
        if (req.headers.origin) {
          let origin;
          try {
            origin = new URL(req.headers.origin);
          } catch {
            fail(403, '无效来源');
          }
          if (origin.host !== req.headers.host) fail(403, '不接受跨站写入');
        }
        if (!(req.headers['content-type'] || '').startsWith('application/json'))
          fail(415, '请使用 application/json');
      }
      if (path === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true });
      if (path === '/api/stats' && req.method === 'GET') {
        const total = db.prepare('SELECT COUNT(*) AS n FROM words WHERE archived=0').get().n;
        const categories = db
          .prepare(
            'SELECT category,COUNT(*) AS count,SUM(stage>0) AS learned FROM words WHERE archived=0 GROUP BY category',
          )
          .all();
        return send(res, 200, {
          total,
          builtInTotal: corpus.total,
          builtInPhrases: corpus.phrases,
          categories,
          learned: db.prepare('SELECT COUNT(*) AS n FROM words WHERE archived=0 AND stage>0').get()
            .n,
          favorites: db
            .prepare('SELECT COUNT(*) AS n FROM words WHERE archived=0 AND favorite=1')
            .get().n,
          pending: db
            .prepare(
              "SELECT COUNT(*) AS n FROM words WHERE archived=0 AND status IN ('pending','processing')",
            )
            .get().n,
          needsReview: db
            .prepare("SELECT COUNT(*) AS n FROM words WHERE archived=0 AND status='needs_review'")
            .get().n,
          due: db
            .prepare('SELECT COUNT(*) AS n FROM words WHERE archived=0 AND due<=?')
            .get(new Date().toISOString()).n,
          today: db
            .prepare(
              "SELECT COUNT(DISTINCT word_id) AS n FROM reviews WHERE date(created,'+8 hours')=date('now','+8 hours')",
            )
            .get().n,
          aiConfigured: !!(
            process.env.AI_API_KEY &&
            process.env.AI_BASE_URL &&
            process.env.AI_MODEL
          ),
        });
      }
      if (path === '/api/words' && req.method === 'GET') {
        let sql = 'SELECT * FROM words WHERE archived=0';
        const args = [];
        for (const key of ['category', 'status'])
          if (url.searchParams.get(key)) {
            sql += ` AND ${key}=?`;
            args.push(url.searchParams.get(key));
          }
        if (url.searchParams.get('q')) {
          sql += ' AND (word LIKE ? OR chinese LIKE ? OR definition LIKE ?)';
          const q = `%${url.searchParams.get('q').slice(0, 120)}%`;
          args.push(q, q, q);
        }
        const filter = url.searchParams.get('filter');
        if (filter === 'favorite') sql += ' AND favorite=1';
        if (filter === 'new') sql += ' AND stage=0';
        if (filter === 'learned') sql += ' AND stage>0';
        if (filter === 'review') {
          sql += ' AND due<=?';
          args.push(new Date().toISOString());
        }
        if (filter === 'incomplete') sql += " AND status='needs_review'";
        sql += ' ORDER BY word COLLATE NOCASE';
        return send(res, 200, db.prepare(sql).all(...args));
      }
      if (path === '/api/lookup' && req.method === 'GET') {
        const word = normalizeWord(url.searchParams.get('word'));
        if (!word || word.length > 120 || !/^[a-z][a-z0-9 '\-()./]*$/.test(word))
          fail(400, '请输入有效英文单词');
        const candidates = wordCandidates(word);
        for (const candidate of candidates) {
          const w = db
            .prepare("SELECT * FROM words WHERE word=? AND definition!=''")
            .get(candidate);
          if (w) return send(res, 200, { ...w, queriedWord: word, learningExcluded: !!w.archived });
        }
        for (const candidate of candidates.slice(0, 3)) {
          const found = await dictionary(candidate, db);
          if (found)
            return send(res, 200, {
              ...found,
              queriedWord: word,
              category: 'daily',
              learningExcluded: isFoundationWord(found.word),
            });
        }
        fail(404, '暂未找到该词。可以将它添加到词库并手动补充释义。');
      }
      if (path === '/api/import/preview' && req.method === 'POST') {
        const b = await body(req);
        const result = parseImport(
          String(b.text || ''),
          String(b.filename || 'words.txt'),
          b.category || 'daily',
        );
        return send(res, 200, {
          ...result,
          existing: result.entries
            .filter((w) => db.prepare('SELECT id FROM words WHERE word=?').get(w.word))
            .map((w) => w.word),
        });
      }
      if (path === '/api/import' && req.method === 'POST') {
        const b = await body(req);
        let parsed;
        if (b.entry) parsed = { entries: [normalizeEntry(b.entry)], errors: [], duplicates: 0 };
        else
          parsed = parseImport(
            String(b.text || ''),
            String(b.filename || 'words.txt'),
            b.category || 'daily',
          );
        if (parsed.errors.length) fail(400, '请先修正预览中所有无效行，再导入');
        const insert = db.prepare(
          "INSERT OR IGNORE INTO words (word,category,chinese,definition,example,phonetic,partOfSpeech,source,status) VALUES (?,?,?,?,?,?,?,'manual',?)",
        );
        let added = 0,
          skipped = parsed.duplicates,
          pending = 0;
        db.exec('BEGIN');
        try {
          for (const w of parsed.entries) {
            const complete = !!(w.definition && w.example);
            const change = insert.run(
              w.word,
              w.category,
              w.chinese,
              w.definition,
              w.example,
              w.phonetic,
              w.partOfSpeech,
              complete ? 'ready' : 'pending',
            ).changes;
            added += change;
            if (!change) skipped++;
            else if (!complete) pending++;
          }
          db.exec('COMMIT');
        } catch (e) {
          db.exec('ROLLBACK');
          throw e;
        }
        setImmediate(enrich);
        return send(res, 201, { added, skipped, pending });
      }
      if (path === '/api/retry' && req.method === 'POST') {
        await body(req);
        const result = db
          .prepare(
            "UPDATE words SET status='pending',error='' WHERE archived=0 AND status='needs_review'",
          )
          .run();
        setImmediate(enrich);
        return send(res, 200, { queued: result.changes });
      }
      if (path === '/api/export' && req.method === 'GET') {
        const words = db
          .prepare(
            'SELECT word,category,chinese,definition,example,phonetic,partOfSpeech FROM words WHERE archived=0 ORDER BY id',
          )
          .all();
        if (url.searchParams.get('format') === 'csv') {
          const keys = [
            'word',
            'category',
            'chinese',
            'definition',
            'example',
            'phonetic',
            'partOfSpeech',
          ];
          const quote = (v) =>
            '"' +
            String(v ?? '')
              .replace(/^[=+@\t\r]/, "'$&")
              .replaceAll('"', '""') +
            '"';
          return send(
            res,
            200,
            '\uFEFF' +
              [keys.join(','), ...words.map((w) => keys.map((k) => quote(w[k])).join(','))].join(
                '\r\n',
              ),
            {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': 'attachment; filename="word-atlas.csv"',
            },
          );
        }
        return send(res, 200, JSON.stringify(words, null, 2), {
          'Content-Disposition': 'attachment; filename="word-atlas.json"',
        });
      }
      const match = path.match(/^\/api\/words\/(\d+)(\/review)?$/);
      if (match) {
        const id = Number(match[1]),
          word = getWord(id);
        if (word.archived) fail(400, '该基础词已移出学习列表，原有学习记录仍保留');
        if (req.method === 'PATCH' && !match[2]) {
          const b = await body(req);
          if (Object.keys(b).length === 1 && 'favorite' in b) {
            db.prepare('UPDATE words SET favorite=? WHERE id=?').run(b.favorite ? 1 : 0, id);
            return send(res, 200, getWord(id));
          }
          const w = normalizeEntry({ ...word, ...b });
          if (w.word !== word.word && db.prepare('SELECT id FROM words WHERE word=?').get(w.word))
            fail(409, '这个单词已存在');
          db.prepare(
            "UPDATE words SET word=?,category=?,chinese=?,definition=?,example=?,phonetic=?,partOfSpeech=?,source='manual',status=?,error='' WHERE id=?",
          ).run(
            w.word,
            w.category,
            w.chinese,
            w.definition,
            w.example,
            w.phonetic,
            w.partOfSpeech,
            w.definition && w.example ? 'ready' : 'needs_review',
            id,
          );
          return send(res, 200, getWord(id));
        }
        if (req.method === 'POST' && match[2]) {
          const b = await body(req);
          if (!['again', 'good', 'easy'].includes(b.rating)) fail(400, '无效复习评分');
          if (!word.definition || !word.example) fail(400, '请补充释义与例句后再复习');
          const stage =
            b.rating === 'again' ? 0 : Math.min(word.stage + (b.rating === 'easy' ? 2 : 1), 7);
          const days = [0, 1, 3, 7, 14, 30, 60, 120][stage];
          const due = new Date(Date.now() + (days ? days * 86400000 : 10 * 60000)).toISOString();
          db.exec('BEGIN');
          try {
            db.prepare('UPDATE words SET stage=?,due=? WHERE id=?').run(stage, due, id);
            db.prepare('INSERT INTO reviews(word_id,rating) VALUES (?,?)').run(id, b.rating);
            db.exec('COMMIT');
          } catch (e) {
            db.exec('ROLLBACK');
            throw e;
          }
          return send(res, 200, getWord(id));
        }
      }
      fail(404, '接口不存在');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') fail(405, '不支持该请求方法');
    const publicRoot = resolve(root, 'public');
    const file = resolve(publicRoot, '.' + decodeURIComponent(path === '/' ? '/index.html' : path));
    if (!file.startsWith(publicRoot + sep)) fail(403, '无权访问');
    let data;
    try {
      data = await readFile(file);
    } catch {
      fail(404, '页面不存在');
    }
    res.writeHead(200, {
      'Content-Type':
        {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'text/javascript; charset=utf-8',
          '.svg': 'image/svg+xml',
        }[extname(file)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      'Referrer-Policy': 'no-referrer',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (e) {
    const status = e.status || 400;
    send(res, status, {
      error:
        status === 500
          ? '服务器暂时出错'
          : e.name === 'TimeoutError'
            ? '在线词典请求超时，请重试'
            : e.message,
    });
  }
});
server.listen(port, host, () =>
  console.log(`Word Atlas → http://${host}:${server.address().port}`),
);
function close() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', close);
process.on('SIGTERM', close);

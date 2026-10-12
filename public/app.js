const isPages = document.documentElement.dataset.mode === 'pages';
const browserAPI = isPages ? (await import('./browser-api.js')).createBrowserAPI() : null;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  book: 'M12 6c-3-3-7-3-10-2v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2z M12 6v15',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
  repeat: 'M20 7H8a5 5 0 0 0-5 5 M17 3l4 4-4 4 M4 17h12a5 5 0 0 0 5-5 M7 13l-4 4 4 4',
  upload: 'M12 16V3 M7 8l5-5 5 5 M3 15v5h18v-5',
  download: 'M12 3v13 M7 11l5 5 5-5 M3 16v5h18v-5',
  edit: 'm15 4 5 5 M4 15 16 3l5 5L9 20l-6 1z',
  settings:
    'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M4 12h16 M15 7l5 5-5 5',
  check: 'm5 12 4 4L19 6',
  sun: 'M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5 19 19 M5 19l1.5-1.5 M17.5 6.5 19 5',
  search: 'M16 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0 M15 15l6 6',
  cursor: 'm4 3 6 18 3-8 8-3z M13 13l7 7',
  close: 'M6 6l12 12 M6 18 18 6',
  volume: 'M11 4 6 8H2v8h4l5 4z M15 8a6 6 0 0 1 0 8 M18 4a11 11 0 0 1 0 16',
  home: 'm3 10 9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8',
  globe: 'M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0 M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',
  briefcase: 'M3 7h18v13H3z M8 7V3h8v4 M3 12c6 4 12 4 18 0 M10 13h4',
  battery: 'M3 6h17v12H3z M20 10h2v4h-2 M12 8l-3 5h5l-3 4',
  back: 'M20 12H4 M9 7l-5 5 5 5',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
function icons(root = document) {
  $$('[data-icon]', root).forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
}
const categories = {
  daily: { name: '日常生活', en: 'Everyday Life', icon: 'home', color: 'peach' },
  travel: { name: '全球旅游', en: 'Global Travel', icon: 'globe', color: 'green' },
  business: { name: '商业工作', en: 'Business & Work', icon: 'briefcase', color: 'blue' },
  energy: { name: '电池储能', en: 'Battery & Energy', icon: 'battery', color: 'lavender' },
};
const views = {
  overview: [
    '学习概览',
    '今天，探索一点新世界',
    '从生活里的小事，到专业里的大事。每一个词，都有它的用处。',
  ],
  library: ['全部词库', '你的词汇，正在连接世界', '统一词库，连接生活、旅行、工作和储能专业。'],
  favorite: ['我的收藏', '留住那些，想再读一次的词', '把喜欢的表达，变成自己的表达。'],
  review: ['到期复习', '再见一面，记得更久', '按记忆间隔复习，让熟悉的词真正留下。'],
  incomplete: [
    '待补充词条',
    '为你的词汇，补上更多语境',
    '检查自动补全结果，编辑释义，或重新尝试在线查询。',
  ],
};
const state = {
  view: 'overview',
  category: '',
  filter: 'all',
  q: '',
  words: [],
  stats: null,
  limit: 6,
  lookupStack: [],
  lookupTicket: 0,
  importTab: 'single',
  editing: null,
  preview: null,
  batchVersion: 0,
  study: [],
  studyIndex: 0,
  revealed: false,
  studied: 0,
  voices: [],
  utterance: null,
};
let token = sessionStorage.getItem('word-atlas-token') || '',
  voiceName = localStorage.getItem('word-atlas-voice') || '',
  rate = Number(localStorage.getItem('word-atlas-rate') || 0.85),
  requestVersion = 0,
  toastTimer;
async function api(path, options = {}) {
  if (browserAPI) return browserAPI.request(path, options);
  const response = await fetch('/api' + path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) showSettings();
    throw new Error(data.error || '请求失败');
  }
  return data;
}
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => ($('#toast').hidden = true), 4500);
}
function show(id) {
  const dialog = $('#' + id);
  if (!dialog.open) dialog.showModal();
}
function stopSpeech() {
  window.speechSynthesis?.cancel();
  if (state.audio) {
    state.audio.pause();
    state.audio = null;
  }
}
function americanVoices() {
  return (window.speechSynthesis?.getVoices() || []).filter(
    (v) => v.lang.replace('_', '-').toLowerCase() === 'en-us',
  );
}
function loadVoices() {
  state.voices = americanVoices();
  $('#voice-select').innerHTML = state.voices.length
    ? state.voices
        .map((v) => `<option value="${esc(v.name)}">${esc(v.name)} · en-US</option>`)
        .join('')
    : '<option value="">未检测到美音语音</option>';
  if (state.voices.some((v) => v.name === voiceName)) $('#voice-select').value = voiceName;
  else if (state.voices.length)
    voiceName =
      state.voices.find((v) => /natural|online|aria|jenny|samantha|david/i.test(v.name))?.name ||
      state.voices[0].name;
  $('#voice-select').value = voiceName;
  $('#voice-note').textContent = state.voices.length
    ? '只列出 en-US 美音。语音来自当前浏览器和系统，部分在线语音需要联网。'
    : '尚未检测到 en-US 语音。请在系统语言设置中安装英语（美国）语音，或使用支持美音的 Edge / Chrome。有美音录音的在线词条仍可播放。';
}
async function speak(text, audio = '') {
  stopSpeech();
  loadVoices();
  const voice = state.voices.find((v) => v.name === voiceName) || state.voices[0];
  if (voice && window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.onerror = (e) => {
      if (!['interrupted', 'canceled'].includes(e.error))
        toast('朗读失败，请检查系统语音或换一个美音声线。');
    };
    state.utterance = utterance;
    window.speechSynthesis.speak(utterance);
    return;
  }
  if (audio && /^https:\/\//.test(audio)) {
    try {
      state.audio = new Audio(audio);
      state.audio.playbackRate = rate;
      await state.audio.play();
      return;
    } catch {
      toast('美音录音暂时无法播放。');
      return;
    }
  }
  toast('当前浏览器未提供美音，请先在发音与设置中检查。');
  showSettings();
}
function example(text) {
  return String(text)
    .split(/([a-zA-Z]+(?:[’'-][a-zA-Z]+)*)/g)
    .map((part, i) =>
      i % 2
        ? `<button data-lookup="${esc(part.toLowerCase().replaceAll('’', "'"))}" title="查看 ${esc(part)} 的释义">${esc(part)}</button>`
        : esc(part),
    )
    .join('');
}
function wordHTML(w) {
  return `<article class="word-card"><button class="word-open" data-word-id="${w.id}"><span class="word-title">${esc(w.word)}</span><span class="word-pos">${esc(w.partOfSpeech || 'word')}</span><span class="word-translation">${esc(w.chinese || categories[w.category]?.name || '自选词汇')}</span><span class="word-definition">${esc(w.definition || (['pending', 'processing'].includes(w.status) ? '后台正在查询释义与例句…' : '待补充英文释义，点击编辑词条'))}</span></button><div class="word-actions"><span class="word-tag">${w.stage > 0 ? '已学习' : w.status === 'needs_review' ? '待补充' : categories[w.category]?.name || '自选'}</span><button class="icon-button" data-speak-id="${w.id}" aria-label="播放 ${esc(w.word)} 的美音">${icon('volume')}</button><button class="icon-button ${w.favorite ? 'favorite-on' : ''}" data-favorite="${w.id}" aria-label="${w.favorite ? '取消收藏' : '收藏'} ${esc(w.word)}" aria-pressed="${!!w.favorite}">${icon('star')}</button></div></article>`;
}
function renderList() {
  $('#result-count').textContent =
    `${state.words.length} 个${state.category ? categories[state.category].name : ''}词汇 · 在语境中认识它们`;
  $('#word-list').innerHTML = state.words.length
    ? state.words.slice(0, state.limit).map(wordHTML).join('')
    : `<div class="empty-state"><strong>${state.view === 'review' ? '此刻，没有到期复习的词' : '这里，等待新的发现'}</strong>${state.view === 'review' ? '先学习几个新词，系统会安排下一次复习。' : '试试切换分类，或添加你想学习的词汇。'}</div>`;
  $('#load-more').hidden = state.limit >= state.words.length;
  $('#list-footnote').textContent =
    `已显示 ${Math.min(state.limit, state.words.length)} / ${state.words.length} 个词条`;
}
function renderStats() {
  const s = state.stats;
  if (!s) return;
  for (const key of ['total', 'learned', 'today', 'due']) $('#stat-' + key).textContent = s[key];
  $('#nav-total').textContent = s.total;
  $('#nav-due').textContent = s.due;
  $('#nav-incomplete').textContent = s.needsReview;
  $('#goal-progress').innerHTML = `${s.today}<span>/ 10</span>`;
  $('#goal-message').textContent =
    s.today >= 10
      ? '今日目标达成，给坚持一个微笑。'
      : `再学 ${10 - s.today} 个词，完成今天的小目标。`;
  $('#progress-ring').style.background =
    `conic-gradient(#ad99ce ${Math.min(s.today / 10, 1) * 360}deg,#f1edf7 0deg)`;
  $('#collections').innerHTML = Object.entries(categories)
    .map(([key, c], i) => {
      const stats = s.categories.find((x) => x.category === key) || { count: 0, learned: 0 };
      return `<button class="collection ${state.category === key ? 'selected' : ''}" data-category="${key}" aria-pressed="${state.category === key}"><div class="collection-top"><span class="collection-icon ${c.color}">${icon(c.icon)}</span><span>0${i + 1} ↗</span></div><strong>${c.name}</strong><p class="english-label">${c.en}</p><div class="collection-bottom"><span><b>${stats.count}</b> 个词汇</span><span>${stats.count ? Math.round((stats.learned / stats.count) * 100) : 0}% 已学习</span></div><div class="collection-progress"><i data-progress="${stats.count ? (stats.learned / stats.count) * 100 : 0}"></i></div></button>`;
    })
    .join('');
  $$('[data-progress]').forEach((el) => (el.style.width = el.dataset.progress + '%'));
}
async function refresh() {
  const version = ++requestVersion;
  const filter = ['favorite', 'review', 'incomplete'].includes(state.view)
    ? state.view
    : state.filter;
  const params = new URLSearchParams({
    q: state.q,
    filter,
    ...(state.category ? { category: state.category } : {}),
  });
  const [words, stats] = await Promise.all([api('/words?' + params), api('/stats')]);
  if (version !== requestVersion) return;
  state.words = words;
  state.stats = stats;
  if (state.view === 'overview' && !state.q && !state.category && state.filter === 'all') {
    const featured = [
      'itinerary',
      'thermal management',
      'stakeholder',
      'routine',
      'state of charge',
      'collaboration',
    ];
    state.words.sort((a, b) => {
      const ai = featured.indexOf(a.word),
        bi = featured.indexOf(b.word);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
  }
  renderList();
  renderStats();
}
async function navigate(view) {
  state.view = view;
  state.filter = 'all';
  state.limit = view === 'overview' ? 6 : 18;
  state.q = '';
  $('#search').value = '';
  const [label, title, subtitle] = views[view];
  $('#page-title').innerHTML = esc(title) + '<span class="title-dot">.</span>';
  $('#page-subtitle').textContent = subtitle;
  $('#breadcrumb').innerHTML = '我的学习空间 <span class="slash">/</span> ' + label;
  $('#hero').hidden = view !== 'overview';
  $('#list-title').textContent = view === 'overview' ? '为你精选' : label;
  $$('[data-view]').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
  $$('[data-filter]').forEach((el) => el.classList.toggle('active', el.dataset.filter === 'all'));
  $('#filters').hidden = ['favorite', 'review', 'incomplete'].includes(view);
  await refresh();
}
function sourceLabel(w) {
  return (
    {
      curated: 'Word Atlas 原创学习资料',
      authored: 'Word Atlas 原创专业词条与搭配',
      'wordnet-ecdict': 'WordNet 英文释义与例句 · ECDICT 中文词义',
      ai: 'AI 自动生成 · 请核对专业内容',
      'dictionaryapi.dev': 'Free Dictionary API · 词典资料',
    }[w.source] || '手动录入'
  );
}
function sourceLinks(w) {
  if (w.source === 'wordnet-ecdict')
    return ' · <a href="https://wordnet.princeton.edu/" target="_blank" rel="noopener">WordNet ↗</a> · <a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noopener">ECDICT ↗</a> · <a href="./licenses.html" target="_blank" rel="noopener">许可声明 ↗</a>';
  if (w.source === 'dictionaryapi.dev')
    return ' · <a href="https://dictionaryapi.dev/" target="_blank" rel="noopener">dictionaryapi.dev ↗</a>';
  return '';
}
function detailActions(w) {
  if (w.learningExcluded) return '<p class="small muted">基础词仅供查义，已从学习列表排除。</p>';
  if (w.id)
    return `<button class="button button-purple" data-favorite="${w.id}">${icon('star')} ${w.favorite ? '已收藏 · 点击取消' : '收藏这个词'}</button>${isPages ? '' : `<button class="button button-white" data-edit="${w.id}">${icon('edit')} 编辑词条</button>`}`;
  return isPages
    ? '<p class="small muted">新增词汇可在本地管理版导入后统一发布。</p>'
    : `<button class="button button-purple" data-action="save-lookup">${icon('plus')} 加入我的词库</button>`;
}
function renderDetail(w) {
  state.lookupUnresolved = false;
  $('#detail-content').innerHTML =
    `<div class="dialog-header"><button class="lookup-back" data-action="lookup-back" ${state.lookupStack.length > 1 ? '' : 'hidden'}>${icon('back')} 返回上一个词</button><span class="badge">${esc(categories[w.category]?.en || 'WORD EXPLORER')}</span><button class="icon-button" data-close="detail-dialog" aria-label="关闭词条">${icon('close')}</button></div><h2 class="detail-word">${esc(w.word)}</h2><div class="detail-meta"><span>${esc(w.phonetic || '美音朗读')}</span><span>${esc(w.partOfSpeech || 'word')}</span><button class="icon-button" data-speak="${esc(w.word)}" data-audio="${esc(w.audio || '')}" aria-label="播放美音">${icon('volume')}</button></div>${w.queriedWord && w.queriedWord !== w.word ? `<p class="small muted">由 ${esc(w.queriedWord)} 关联到词形 ${esc(w.word)}</p>` : ''}<p class="detail-chinese">${esc(w.chinese || '通过英文释义，直接理解词义')}</p><div class="detail-label">ENGLISH DEFINITION</div><p class="detail-definition">${esc(w.definition || 'This entry is waiting for a definition.')}</p><div class="detail-label">IN CONTEXT</div>${w.example ? `<div class="example-box">${example(w.example)}</div><p class="example-note">点击例句中的任何英文单词，继续探索释义。</p><button class="text-button" data-speak="${esc(w.example)}">${icon('volume')} 朗读完整例句 · 美音</button>` : '<p class="muted">暂无例句，可编辑补充，或稍后重试自动补全。</p>'}${
      w.meanings?.length > 1
        ? `<div class="detail-label">MORE MEANINGS</div>${w.meanings
            .slice(1, 4)
            .map(
              (m) =>
                `<p class="secondary-meaning"><span>${esc(m.partOfSpeech)}</span>${esc(m.definition)}</p>`,
            )
            .join('')}`
        : ''
    }${w.error ? `<p class="small muted">${esc(w.error)}</p>` : ''}<div class="detail-actions">${detailActions(w)}</div><p class="source-note ${w.source === 'ai' ? 'source-ai' : ''}">来源：${esc(sourceLabel(w))}${sourceLinks(w)}${w.status === 'needs_review' ? ' · 内容待补充' : ''}</p>`;
}
function openWord(w) {
  state.lookupTicket++;
  state.lookupStack = [w];
  renderDetail(w);
  show('detail-dialog');
}
async function lookup(word) {
  const ticket = ++state.lookupTicket;
  const previous = state.lookupStack.at(-1);
  state.lookupUnresolved = true;
  $('#detail-content').innerHTML =
    `<div class="dialog-header"><button class="lookup-back" data-action="lookup-back">${icon('back')} 返回</button><button class="icon-button" data-close="detail-dialog" aria-label="关闭">${icon('close')}</button></div><div class="lookup-loading">正在查找 <strong>${esc(word)}</strong> 的释义…</div>`;
  show('detail-dialog');
  try {
    const w = await api('/lookup?' + new URLSearchParams({ word }));
    if (ticket !== state.lookupTicket) return;
    if (!previous) state.lookupStack = [];
    state.lookupStack.push(w);
    renderDetail(w);
  } catch (e) {
    if (ticket !== state.lookupTicket) return;
    $('#detail-content').innerHTML =
      `<div class="dialog-header"><button class="lookup-back" data-action="lookup-back">${icon('back')} 返回</button><button class="icon-button" data-close="detail-dialog" aria-label="关闭">${icon('close')}</button></div><h2 class="detail-word">${esc(word)}</h2><p class="muted">${esc(e.message)}</p>${isPages ? '<p class="small muted">可在本地管理版补充此词后统一发布。</p>' : `<div class="detail-actions"><button class="button button-purple" data-add-word="${esc(word)}">手动添加到词库</button></div>`}`;
  }
}
async function toggleFavorite(id) {
  const word = state.words.find((w) => w.id === id) || state.lookupStack.find((w) => w.id === id);
  if (!word) return;
  const updated = await api('/words/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ favorite: !word.favorite }),
  });
  state.lookupStack = state.lookupStack.map((w) => (w.id === id ? updated : w));
  if ($('#detail-dialog').open && state.lookupStack.at(-1)?.id === id) renderDetail(updated);
  await refresh();
}
function setImportTab(tab) {
  state.importTab = tab;
  $('#single-form').hidden = tab !== 'single';
  $('#batch-panel').hidden = tab !== 'batch';
  $$('[data-import-tab]').forEach((el) =>
    el.classList.toggle('active', el.dataset.importTab === tab),
  );
  $('#import-feedback').textContent = '';
}
function openImport(w = null) {
  state.editing = w?.id || null;
  $('#single-form').reset();
  for (const key of ['word', 'category', 'chinese', 'partOfSpeech', 'definition', 'example'])
    if (w?.[key]) $('#single-form').elements[key].value = w[key];
  if (!w?.category) $('#single-form').elements.category.value = state.category || 'daily';
  $('#single-form button[type=submit]').innerHTML = state.editing
    ? '保存词条'
    : '添加至词库 ' + icon('plus');
  setImportTab('single');
  show('import-dialog');
}
function invalidatePreview() {
  state.batchVersion++;
  state.preview = null;
  $('#import-preview').hidden = true;
  $('#commit-import').disabled = true;
}
async function readUpload(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) throw new Error('文件不能超过 2 MB');
  if (!/\.(txt|csv|tsv|json)$/i.test(file.name))
    throw new Error('请选择 CSV、TSV、TXT 或 JSON 文件');
  $('#batch-text').value = await file.text();
  const ext = file.name.split('.').at(-1).toLowerCase();
  $('#batch-format').value = 'words.' + ext;
  invalidatePreview();
  $('#import-feedback').textContent = `已读取 ${file.name}，请预览后导入。`;
}
async function previewImport() {
  const version = state.batchVersion;
  const b = {
    text: $('#batch-text').value,
    filename: $('#batch-format').value,
    category: $('#batch-category').value,
  };
  $('#preview-button').disabled = true;
  try {
    const preview = await api('/import/preview', { method: 'POST', body: JSON.stringify(b) });
    if (version !== state.batchVersion) return;
    state.preview = { ...b, version };
    const newCount = preview.entries.length - preview.existing.length;
    $('#import-preview').innerHTML =
      `<strong>${newCount} 个新词 · ${preview.existing.length + preview.duplicates} 个重复 · ${preview.errors.length} 行需修正</strong><table><thead><tr><th>词汇</th><th>领域</th><th>状态</th></tr></thead><tbody>${preview.entries
        .slice(0, 30)
        .map(
          (w) =>
            `<tr><td>${esc(w.word)}</td><td>${esc(categories[w.category].name)}</td><td>${preview.existing.includes(w.word) ? '已存在 · 跳过' : w.definition && w.example ? '资料完整' : '自动补全'}</td></tr>`,
        )
        .join(
          '',
        )}</tbody></table>${preview.entries.length > 30 ? '<p>仅预览前 30 条；确认后导入全部有效词条。</p>' : ''}${preview.errors.map((e) => `<p class="error">词条 ${e.row}：${esc(e.message)}</p>`).join('')}`;
    $('#import-preview').hidden = false;
    $('#commit-import').disabled = preview.errors.length > 0 || newCount === 0;
    $('#import-feedback').textContent = preview.errors.length ? '请修正无效行后重新预览。' : '';
  } finally {
    $('#preview-button').disabled = false;
  }
}
async function commitImport() {
  if (!state.preview || state.preview.version !== state.batchVersion) return;
  $('#commit-import').disabled = true;
  try {
    const result = await api('/import', { method: 'POST', body: JSON.stringify(state.preview) });
    $('#import-feedback').textContent =
      `已新增 ${result.added} 个词汇，跳过 ${result.skipped} 个重复词。${result.pending ? `后台正在补全 ${result.pending} 个词条。` : ''}`;
    state.preview = null;
    await refresh();
  } catch (e) {
    $('#commit-import').disabled = false;
    throw e;
  }
}
async function startStudy() {
  const params = new URLSearchParams({ ...(state.category ? { category: state.category } : {}) });
  const words = await api('/words?' + params);
  const now = new Date().toISOString();
  const ready = words.filter((w) => w.definition && w.example);
  const due = ready.filter((w) => w.due && w.due <= now);
  const unseen = ready.filter((w) => !w.due);
  let pool = state.view === 'favorite' ? ready.filter((w) => w.favorite) : [...due, ...unseen];
  if (!pool.length && ready.length)
    pool = ready.sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  if (!pool.length) {
    toast('该领域还没有资料完整的词条，请先补充释义和例句。');
    return;
  }
  state.study = pool.slice(0, 10);
  state.studyIndex = 0;
  state.studied = 0;
  state.revealed = false;
  renderStudy();
  show('study-dialog');
}
function renderStudy() {
  const w = state.study[state.studyIndex];
  if (!w) {
    $('#study-content').innerHTML =
      `<div class="study-top"><span>TODAY, A LITTLE FURTHER.</span><button class="icon-button" data-close="study-dialog" aria-label="关闭学习">${icon('close')}</button></div><div class="study-complete"><span>✦</span><h2>又多了 ${state.studied} 个表达的可能。</h2><p>本轮学习完成，词汇进度已保存。下次继续。</p><button class="button button-purple" data-close="study-dialog">回到我的词汇地图</button></div>`;
    return;
  }
  const nextGood = [0, 1, 3, 7, 14, 30, 60, 120][Math.min(w.stage + 1, 7)],
    nextEasy = [0, 1, 3, 7, 14, 30, 60, 120][Math.min(w.stage + 2, 7)];
  $('#study-content').innerHTML =
    `<div class="study-top"><span>${esc(categories[w.category].en)} · ${state.studyIndex + 1} / ${state.study.length}</span><button class="icon-button" data-close="study-dialog" aria-label="关闭学习">${icon('close')}</button></div><div class="study-progress"><i id="study-bar"></i></div><p class="eyebrow">CAN YOU RECALL THIS WORD?</p><h2 class="detail-word">${esc(w.word)}</h2><div class="detail-meta"><span>${esc(w.partOfSpeech)}</span><button class="icon-button" data-speak="${esc(w.word)}" data-audio="${esc(w.audio || '')}" aria-label="播放美音">${icon('volume')}</button></div>${state.revealed ? `<div class="study-answer"><p class="detail-chinese">${esc(w.chinese)}</p><p class="detail-definition">${esc(w.definition)}</p><div class="detail-label">IN CONTEXT · 点击单词查看释义</div><div class="example-box">${example(w.example)}</div><button class="text-button" data-speak="${esc(w.example)}">${icon('volume')} 美音朗读例句</button></div><div class="rating-buttons"><button data-rating="again">还需练习<small>10 分钟后再见 · 1</small></button><button data-rating="good">记住了<small>${nextGood} 天后复习 · 2</small></button><button data-rating="easy">很熟悉<small>${nextEasy} 天后复习 · 3</small></button></div>` : `<div class="study-hidden">先想一想它的意思，再翻开答案。</div><button class="button button-purple full" data-action="reveal">查看释义与例句 <small>SPACE</small></button>`}`;
  $('#study-bar').style.width = (state.studyIndex / state.study.length) * 100 + '%';
}
async function rateWord(rating) {
  const w = state.study[state.studyIndex];
  if (!w || state.ratingBusy) return;
  state.ratingBusy = true;
  try {
    await api('/words/' + w.id + '/review', { method: 'POST', body: JSON.stringify({ rating }) });
    stopSpeech();
    state.studyIndex++;
    state.studied++;
    state.revealed = false;
    renderStudy();
    await refresh();
  } finally {
    state.ratingBusy = false;
  }
}
function showSettings() {
  loadVoices();
  $('#rate-select').value = String(rate);
  $('#token-input').value = token;
  $('#backend-note').textContent = isPages
    ? '词汇由本地管理版统一维护、补全后发布。更新词库后刷新页面即可加载；收藏和学习进度仅保存在当前浏览器，不跨设备同步。'
    : state.stats?.aiConfigured
      ? '在线词典 + AI 补全已配置。AI 资料会标记来源，建议核对专业内容。'
      : '在线词典已启用。未收录的专业词可手动填写，或在服务器 .env 中配置 AI_BASE_URL、AI_MODEL、AI_API_KEY。';
  show('settings-dialog');
}
function download(text, filename, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportWords(format = 'json') {
  if (browserAPI) {
    download(
      await browserAPI.exportWords(format),
      'word-atlas.' + format,
      format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
    );
    toast('词库已导出。');
    return;
  }
  const response = await fetch('/api/export?format=' + format, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error);
  }
  download(
    await response.text(),
    'word-atlas.' + format,
    format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json',
  );
  toast('词库已导出。');
}
async function action(name) {
  switch (name) {
    case 'backup-progress':
      download(browserAPI.exportProgress(), 'word-atlas-progress.json', 'application/json');
      toast('本机学习记录已备份。');
      break;
    case 'restore-progress':
      $('#progress-file').click();
      break;
    case 'import':
      openImport();
      break;
    case 'export':
      await exportWords();
      break;
    case 'settings':
      showSettings();
      break;
    case 'study':
      await startStudy();
      break;
    case 'more':
      state.limit += 18;
      renderList();
      break;
    case 'reveal':
      state.revealed = true;
      renderStudy();
      break;
    case 'lookup-back':
      state.lookupTicket++;
      if (!state.lookupUnresolved && state.lookupStack.length > 1) state.lookupStack.pop();
      if (state.lookupStack.length) renderDetail(state.lookupStack.at(-1));
      else $('#detail-dialog').close();
      break;
    case 'save-lookup': {
      const w = state.lookupStack.at(-1);
      $('#detail-dialog').close();
      openImport(w);
      break;
    }
    case 'retry': {
      const result = await api('/retry', { method: 'POST', body: '{}' });
      toast(`已安排重试 ${result.queued} 个词条。`);
      await refresh();
      break;
    }
  }
}
document.addEventListener('click', (event) => {
  const el = event.target.closest('button');
  if (!el) return;
  (async () => {
    if (el.dataset.close) {
      $('#' + el.dataset.close).close();
      stopSpeech();
      return;
    }
    if (el.dataset.action) return action(el.dataset.action);
    if (el.dataset.view) return navigate(el.dataset.view);
    if (el.dataset.category) {
      state.category = state.category === el.dataset.category ? '' : el.dataset.category;
      state.limit = 18;
      return refresh();
    }
    if (el.dataset.filter) {
      state.filter = el.dataset.filter;
      state.limit = 18;
      $$('[data-filter]').forEach((b) => b.classList.toggle('active', b === el));
      return refresh();
    }
    if (el.dataset.wordId) {
      const w = state.words.find((w) => w.id === Number(el.dataset.wordId));
      if (w) openWord(w);
      return;
    }
    if (el.dataset.speakId) {
      const w = state.words.find((w) => w.id === Number(el.dataset.speakId));
      return speak(w.word, w.audio);
    }
    if (el.dataset.speak) return speak(el.dataset.speak, el.dataset.audio);
    if (el.dataset.favorite) return toggleFavorite(Number(el.dataset.favorite));
    if (el.dataset.lookup) return lookup(el.dataset.lookup);
    if (el.dataset.edit) {
      const w = state.lookupStack.at(-1);
      $('#detail-dialog').close();
      openImport(w);
      return;
    }
    if (el.dataset.addWord) {
      $('#detail-dialog').close();
      openImport({ word: el.dataset.addWord });
      return;
    }
    if (el.dataset.importTab) {
      state.editing = null;
      $('#single-form button[type=submit]').textContent = '添加至词库';
      return setImportTab(el.dataset.importTab);
    }
    if (el.dataset.rating) return rateWord(el.dataset.rating);
    if (el.dataset.export) return exportWords(el.dataset.export);
  })().catch((e) => toast(e.message));
});
let searchTimer;
$('#search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.q = $('#search').value;
    state.limit = 18;
    refresh().catch((e) => toast(e.message));
  }, 200);
});
$('#single-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const entry = Object.fromEntries(new FormData(event.target));
  const button = event.target.querySelector('[type=submit]');
  button.disabled = true;
  try {
    const result = await api(state.editing ? '/words/' + state.editing : '/import', {
      method: state.editing ? 'PATCH' : 'POST',
      body: JSON.stringify(state.editing ? entry : { entry }),
    });
    $('#import-feedback').textContent = state.editing
      ? '词条已更新。'
      : result.added
        ? `已添加 ${entry.word}${result.pending ? '，后台正在补全。' : '。'}`
        : '这个词已经在词库中，未重复添加。';
    if (!state.editing && result.added) event.target.elements.word.value = '';
    await refresh();
  } catch (e) {
    $('#import-feedback').textContent = e.message;
  } finally {
    button.disabled = false;
  }
});
for (const id of ['batch-text', 'batch-format', 'batch-category'])
  $('#' + id).addEventListener('input', invalidatePreview);
$('#preview-button').addEventListener('click', () =>
  previewImport().catch((e) => ($('#import-feedback').textContent = e.message)),
);
$('#commit-import').addEventListener('click', () =>
  commitImport().catch((e) => ($('#import-feedback').textContent = e.message)),
);
$('#file-input').addEventListener('change', (event) =>
  readUpload(event.target.files[0]).catch((e) => toast(e.message)),
);
$('#dropzone').addEventListener('dragover', (event) => {
  event.preventDefault();
  $('#dropzone').classList.add('dragging');
});
$('#dropzone').addEventListener('dragleave', () => $('#dropzone').classList.remove('dragging'));
$('#dropzone').addEventListener('drop', (event) => {
  event.preventDefault();
  $('#dropzone').classList.remove('dragging');
  readUpload(event.dataTransfer.files[0]).catch((e) => toast(e.message));
});
$('#template-button').addEventListener('click', () =>
  download(
    '\uFEFFword,category,chinese,definition,example\r\nresilience,business,韧性,"The ability to recover from difficulty.","Resilience helps the team adapt to change."\r\nthermal conductivity,energy,导热系数,,\r\n',
    'word-atlas-template.csv',
    'text/csv;charset=utf-8',
  ),
);
$('#voice-select').addEventListener('change', () => {
  voiceName = $('#voice-select').value;
  localStorage.setItem('word-atlas-voice', voiceName);
});
$('#rate-select').addEventListener('change', () => {
  rate = Number($('#rate-select').value);
  localStorage.setItem('word-atlas-rate', rate);
});
$('#save-token').addEventListener('click', () => {
  token = $('#token-input').value.trim();
  sessionStorage.setItem('word-atlas-token', token);
  refresh()
    .then(() => toast('连接成功。'))
    .catch((e) => toast(e.message));
});
document.addEventListener('keydown', (event) => {
  if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === '/' && !$('dialog[open]')) {
    event.preventDefault();
    $('#search').focus();
  }
  if ($('#study-dialog').open && !$('#detail-dialog').open) {
    if (event.code === 'Space' && !state.revealed && state.study[state.studyIndex]) {
      event.preventDefault();
      state.revealed = true;
      renderStudy();
    }
    if (state.revealed && ['1', '2', '3'].includes(event.key))
      rateWord({ 1: 'again', 2: 'good', 3: 'easy' }[event.key]).catch((e) => toast(e.message));
  }
});
$$('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    stopSpeech();
    if (dialog.id === 'detail-dialog') {
      state.lookupTicket++;
      state.lookupStack = [];
    }
  });
});
if (isPages) {
  $$('[data-action="import"], [data-view="incomplete"], [data-action="retry"]').forEach(
    (el) => (el.hidden = true),
  );
  $('#service-access').hidden = true;
  $('#browser-progress-tools').hidden = false;
  $('#backend-heading').textContent = '统一词库更新';
  $('#export-note').textContent =
    '导出包含当前发布的词汇与资料。收藏、复习进度请另行备份学习记录。';
  $('.profile small').textContent = '统一词库 · 本机学习记录';
  $('.online-dot').title = '在线词库';
  $('#published-notice').hidden = false;
}
$('#progress-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('备份文件不能超过 10 MB。');
    const count = browserAPI.importProgress(await file.text());
    await refresh();
    toast('已恢复 ' + count + ' 条学习记录。');
  } catch (error) {
    toast(error.message);
  } finally {
    event.target.value = '';
  }
});
icons();
$$('.category-select').forEach(
  (select) =>
    (select.innerHTML = Object.entries(categories)
      .map(([id, c]) => `<option value="${id}">${c.name} · ${c.en}</option>`)
      .join('')),
);
loadVoices();
if (window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
refresh().catch((e) => toast(e.message));
setInterval(() => {
  if (state.stats?.pending && !document.hidden) refresh().catch(() => {});
}, 3000);

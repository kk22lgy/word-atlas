export function wordCandidates(word) {
  word = String(word).trim().replace(/\s+/g, ' ').toLowerCase();
  const list = [word];
  const irregular = {
    went: 'go',
    gone: 'go',
    bought: 'buy',
    made: 'make',
    took: 'take',
    taken: 'take',
    was: 'be',
    were: 'be',
    are: 'be',
    been: 'be',
    has: 'have',
    had: 'have',
    did: 'do',
    does: 'do',
    children: 'child',
    people: 'person',
    better: 'good',
    leaves: 'leave',
  };
  if (irregular[word]) list.push(irregular[word]);
  if (word.endsWith('ies')) list.push(word.slice(0, -3) + 'y');
  if (word.endsWith('ing')) {
    const stem = word.slice(0, -3);
    list.push(stem, stem + 'e');
    if (/(.)\1$/.test(stem)) list.push(stem.slice(0, -1));
  }
  if (word.endsWith('ed')) list.push(word.slice(0, -2), word.slice(0, -1));
  if (word.endsWith('es')) list.push(word.slice(0, -2));
  if (word.endsWith('s')) list.push(word.slice(0, -1));
  return [...new Set(list)];
}

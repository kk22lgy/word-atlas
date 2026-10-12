// Deterministic external dictionary fixture, loaded only by the API test subprocess.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = new URL(String(input));
  if (url.hostname !== 'api.dictionaryapi.dev') return realFetch(input, options);
  const word = decodeURIComponent(url.pathname.split('/').at(-1));
  if (word === 'networkfailure') throw new Error('Fixture network unavailable');
  if (word === 'unrecognizedterm') return new Response('{}', { status: 404 });
  return new Response(
    JSON.stringify([
      {
        word,
        phonetic: '/test/',
        phonetics: [],
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: `A dictionary definition of ${word}.`,
                example: `We discussed ${word} today.`,
              },
            ],
          },
        ],
      },
    ]),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

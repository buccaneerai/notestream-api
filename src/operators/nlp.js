import request from 'request-promise';
import { from, of, zip } from 'rxjs';
import { bufferCount, map, mergeMap, share } from 'rxjs/operators';

// const isDone = words => nextWord === '.';

// const textReducer = () => (acc, nextWord) => (
//   // isDone(acc)
//   // ? [`${acc[0]} ${nextWord}`, true]
//   // : (acc[1] ? [nextWord, false] : [`${acc[0]} ${nextWord}`, false])
// );

const wordStringReducer = () => (acc, w) => (acc ? `${acc} ${w.text}` : w.text);

const charIndexReducer = () => (acc, [words, tags]) => [
  words,
  tags,
  acc,
  acc + words.reduce(w => w.text.length + 1, 0) - 1,
];

const stringifyWords = () => words$ =>
  words$.pipe(
    // scan(textReducer(), [null, false]),
    // filter(([, done]) => done),
    map(words => words.reduce(wordStringReducer(), ''))
  );

const extractTags = (spacyUrl, _request = request) => text => {
  const promise = _request({
    uri: spacyUrl,
    method: 'POST',
    json: true,
    body: { text },
  });
  const nlpOut$ = from(promise);
  return nlpOut$;
};

const linkTagsToWords = () => (words, { entities, matches, tokens }) => {
  const wordsWithCharIndex = words.reduce(
    (acc, w, i) => [
      ...acc,
      i === 0
        ? { ...w, length: w.text.length, charIndex: 0 }
        : {
            ...w,
            length: w.text.length,
            // add an extra character for "spaces" between words
            charIndex: acc[i - 1].charIndex + acc[i - 1].length + 1,
          },
    ],
    []
  );
  const wordDict = wordsWithCharIndex.reduce(
    (acc, w) => ({
      ...acc,
      [w.charIndex]: w.i,
    }),
    {}
  );
  // FIXME: there is something wrong here...  the indexes on the matches
  // do not seem to correspond to character indexes...
  const matchesWithWordIndexes = matches.map(m => ({
    ...m,
    wordIndexes: wordsWithCharIndex
      .filter(w => w.charIndex >= m.i && w.charIndex <= m.endI)
      .map(w => w.i),
  }));
  return {
    entities: entities.map(e => ({ ...e, wordIndex: wordDict[e.i.toString()] })),
    tokens: tokens.map(t => ({ ...t, wordIndex: wordDict[t.i.toString()] })),
    matches: matchesWithWordIndexes,
  };
};

const nlp = ({
  spacyUrl = process.env.NLP_SERVICE_URL,
  maxWords = 20,
  _stringifyWords = stringifyWords,
  _extractTags = extractTags,
  _linkTagsToWords = linkTagsToWords,
} = {}) => stt$ => {
  const sttBuffer$ = stt$.pipe(bufferCount(maxWords), share());
  const string$ = sttBuffer$.pipe(_stringifyWords());
  const nlpOut$ = zip(sttBuffer$, string$).pipe(
    mergeMap(([words, string]) => zip(of(words), _extractTags(spacyUrl)(string))),
    // scan(charIndexReducer(), [null, null, 0]),
    map(([words, tags]) => _linkTagsToWords()(words, tags))
  );
  return nlpOut$;
};

export const testExports = { charIndexReducer, wordStringReducer, linkTagsToWords };
export default nlp;

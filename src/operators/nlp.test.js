const {expect} = require('chai');
const {marbles} = require('rxjs-marbles/mocha');

const nlp, {testExports} = require('./nlp');
const {wordStringReducer,linkTagsToWords} = testExports;

const rawText = "hi. hi my name is Ein. I'm dr. Wishart. how can I help you? hi. uh. I've got this crazy bad headache.";

const words = [
  {text: 'hi.',   i: 0},
  {text: 'hi',   i: 1},
  {text: 'my',   i: 2},
  {text: 'name',   i: 3},
  {text: 'is',   i: 4},
  {text: 'Ein.',   i: 5},
  {text: 'I\'m',   i: 6},
  {text: 'dr.',   i: 7},
  {text: 'Wishart.',   i: 8},
  {text: 'how',   i: 9},
  {text: 'can',   i: 10},
  {text: 'I',   i: 11},
  {text: 'help',   i: 12},
  {text: 'you?',   i: 13},
  {text: 'hi.',   i: 14},
  {text: 'uh.',   i: 15},
  {text: 'I\'ve',   i: 16},
  {text: 'got',   i: 17},
  {text: 'this',   i: 18},
  {text: 'crazy',   i: 19},
  {text: 'bad',   i: 20},
  {text: 'headache.',   i: 21},
];

const entities = [
  {
    "endI": 38,
    "i": 31,
    "label": "PERSON",
    "text": "Wishart"
  },
];

const matches = [
  {
    "endI": 1,
    "i": 0,
    "matchId": "GREETINGS",
    "text": "hi"
  },
  {
    "endI": 3,
    "i": 2,
    "matchId": "GREETINGS",
    "text": "hi"
  },
  {
    "endI": 36,
    "i": 34,
    "matchId": "HEADACHE_ACUTE",
    "text": "bad headache"
  },
  {
    "endI": 36,
    "i": 35,
    "matchId": "HEADACHE",
    "text": "headache"
  },
];

const tokens = [
  {
    "dep": "ROOT",
    "i": 0,
    "pos": "INTJ",
    "prob": -20.0,
    "tag": "UH",
    "text": "hi"
  },
  {
    "dep": "punct",
    "i": 2,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "."
  },
  {
    "dep": "intj",
    "i": 4,
    "pos": "INTJ",
    "prob": -20.0,
    "tag": "UH",
    "text": "hi"
  },
  {
    "dep": "poss",
    "i": 7,
    "pos": "DET",
    "prob": -20.0,
    "tag": "PRP$",
    "text": "my"
  },
  {
    "dep": "nsubj",
    "i": 10,
    "pos": "NOUN",
    "prob": -20.0,
    "tag": "NN",
    "text": "name"
  },
  {
    "dep": "ROOT",
    "i": 15,
    "pos": "AUX",
    "prob": -20.0,
    "tag": "VBZ",
    "text": "is"
  },
  {
    "dep": "attr",
    "i": 18,
    "pos": "PROPN",
    "prob": -20.0,
    "tag": "NNP",
    "text": "Ein"
  },
  {
    "dep": "punct",
    "i": 21,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "."
  },
  {
    "dep": "nsubj",
    "i": 23,
    "pos": "PRON",
    "prob": -20.0,
    "tag": "PRP",
    "text": "I"
  },
  {
    "dep": "ROOT",
    "i": 24,
    "pos": "AUX",
    "prob": -20.0,
    "tag": "VBP",
    "text": "'m"
  },
  {
    "dep": "dep",
    "i": 27,
    "pos": "PROPN",
    "prob": -20.0,
    "tag": "NNP",
    "text": "dr"
  },
  {
    "dep": "attr",
    "i": 29,
    "pos": "PROPN",
    "prob": -20.0,
    "tag": "NNP",
    "text": "."
  },
  {
    "dep": "ROOT",
    "i": 31,
    "pos": "PROPN",
    "prob": -20.0,
    "tag": "NNP",
    "text": "Wishart"
  },
  {
    "dep": "punct",
    "i": 38,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "."
  },
  {
    "dep": "advmod",
    "i": 40,
    "pos": "ADV",
    "prob": -20.0,
    "tag": "WRB",
    "text": "how"
  },
  {
    "dep": "dative",
    "i": 44,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "/n"
  },
  {
    "dep": "aux",
    "i": 47,
    "pos": "VERB",
    "prob": -20.0,
    "tag": "MD",
    "text": "can"
  },
  {
    "dep": "nsubj",
    "i": 51,
    "pos": "PRON",
    "prob": -20.0,
    "tag": "PRP",
    "text": "I"
  },
  {
    "dep": "ROOT",
    "i": 53,
    "pos": "VERB",
    "prob": -20.0,
    "tag": "VB",
    "text": "help"
  },
  {
    "dep": "dobj",
    "i": 58,
    "pos": "PRON",
    "prob": -20.0,
    "tag": "PRP",
    "text": "you"
  },
  {
    "dep": "punct",
    "i": 61,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "?"
  },
  {
    "dep": "ROOT",
    "i": 63,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "/n"
  },
  {
    "dep": "",
    "i": 66,
    "pos": "SPACE",
    "prob": -20.0,
    "tag": "_SP",
    "text": " "
  },
  {
    "dep": "ROOT",
    "i": 67,
    "pos": "PROPN",
    "prob": -20.0,
    "tag": "NNP",
    "text": "/n"
  },
  {
    "dep": "ROOT",
    "i": 70,
    "pos": "INTJ",
    "prob": -20.0,
    "tag": "UH",
    "text": "hi"
  },
  {
    "dep": "punct",
    "i": 72,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "."
  },
  {
    "dep": "ROOT",
    "i": 74,
    "pos": "INTJ",
    "prob": -20.0,
    "tag": "UH",
    "text": "uh"
  },
  {
    "dep": "punct",
    "i": 76,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "."
  },
  {
    "dep": "nsubj",
    "i": 78,
    "pos": "PRON",
    "prob": -20.0,
    "tag": "PRP",
    "text": "I"
  },
  {
    "dep": "aux",
    "i": 79,
    "pos": "AUX",
    "prob": -20.0,
    "tag": "VB",
    "text": "'ve"
  },
  {
    "dep": "ROOT",
    "i": 83,
    "pos": "VERB",
    "prob": -20.0,
    "tag": "VBN",
    "text": "got"
  },
  {
    "dep": "det",
    "i": 87,
    "pos": "DET",
    "prob": -20.0,
    "tag": "DT",
    "text": "this"
  },
  {
    "dep": "amod",
    "i": 92,
    "pos": "ADJ",
    "prob": -20.0,
    "tag": "JJ",
    "text": "crazy"
  },
  {
    "dep": "intj",
    "i": 98,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "/n"
  },
  {
    "dep": "amod",
    "i": 101,
    "pos": "ADJ",
    "prob": -20.0,
    "tag": "JJ",
    "text": "bad"
  },
  {
    "dep": "dobj",
    "i": 105,
    "pos": "NOUN",
    "prob": -20.0,
    "tag": "NN",
    "text": "headache"
  },
  {
    "dep": "punct",
    "i": 113,
    "pos": "PUNCT",
    "prob": -20.0,
    "tag": ".",
    "text": "."
  },
];

describe('operators.nlp', () => {
  // it('should link NLP tags to correct word indexes', () => {
  //   const out = linkTagsToWords()(words, {entities, matches, tokens});
  //   expect(out.entities).to.deep.include({...entities[0], wordIndex: 8});
  //   expect(out.tokens).to.deep.include({...tokens[0], wordIndex: 0});
  //   expect(out.tokens).to.deep.include({
  //     "dep": "attr",
  //     "i": 18,
  //     "pos": "PROPN",
  //     "prob": -20.0,
  //     "tag": "NNP",
  //     "text": "Ein",
  //     wordIndex: 5,
  //   });
  //   console.log('out.matches', out.matches);
  //   expect(out.matches).to.deep.include({...matches[0]});
  //   console.log('MATCHES', JSON.stringify(matches));
  //   expect(out.matches).to.deep.include({...matches[0]});
  //   expect(out.matches).to.deep.include({...matches[1]});
  //   expect(out.matches).to.deep.include({...matches[2]});
  // });

  it('should stringify words correctly', () => {
    const string = words.reduce(wordStringReducer(), '');
    expect(string).to.equal(rawText);
  });
});

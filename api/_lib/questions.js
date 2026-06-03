const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(process.cwd(), 'src', 'main', 'resources', 'questions.json');

function readQuestions() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));

  return questions.map((question) => shuffleQuestion({
    ...question,
    choices: [...question.choices]
  }));
}

function shuffleQuestion(question) {
  const random = createSeededRandom(question.id);
  const shuffledChoices = question.choices
    .map((choice, index) => ({
      choice,
      originalIndex: index,
      order: random()
    }))
    .sort((left, right) => left.order - right.order);

  return {
    ...question,
    choices: shuffledChoices.map((entry) => entry.choice),
    correctIndex: shuffledChoices.findIndex((entry) => entry.originalIndex === question.correctIndex)
  };
}

function createSeededRandom(seed) {
  let state = (seed ^ 0x6d2b79f5) >>> 0;

  return () => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

module.exports = {
  getJsonBody,
  readQuestions
};

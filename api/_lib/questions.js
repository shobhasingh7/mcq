const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(process.cwd(), 'src', 'main', 'resources', 'questions-by-topic');

function readQuestions(topic) {
  const topicFile = path.join(QUESTIONS_DIR, `${normalizeTopic(topic)}.json`);
  const questions = JSON.parse(fs.readFileSync(topicFile, 'utf8'));

  return questions.map((question) => shuffleQuestion({
    ...question,
    choices: [...question.choices]
  }));
}

function listTopics() {
  return fs.readdirSync(QUESTIONS_DIR)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => {
      const id = fileName.replace(/\.json$/, '');
      const questions = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, fileName), 'utf8'));

      return {
        id,
        label: formatTopicLabel(id),
        questionCount: questions.length
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

function normalizeTopic(topic) {
  if (!topic) {
    throw new Error('Topic is required.');
  }

  return String(topic).trim().toLowerCase();
}

function formatTopicLabel(topic) {
  if (topic === 'aws') {
    return 'AWS';
  }
  if (topic === 'amq') {
    return 'AMQ';
  }
  if (topic === 'dsa') {
    return 'DSA';
  }
  if (topic === 'dp') {
    return 'DP';
  }
  if (topic === 'springboot') {
    return 'Spring Boot';
  }
  if (topic === 'spring') {
    return 'Spring';
  }
  return topic.charAt(0).toUpperCase() + topic.slice(1);
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
  listTopics,
  normalizeTopic,
  readQuestions
};

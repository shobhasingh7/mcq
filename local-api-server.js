const http = require('http');
const { listTopics, normalizeTopic, readQuestions } = require('./api/_lib/questions');
const { incrementVisitCount } = require('./api/_lib/visits');

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Missing URL.' });
    return;
  }

  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/topics') {
    sendJson(res, 200, listTopics());
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/visits') {
    sendJson(res, 200, { count: incrementVisitCount() });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/questions') {
    try {
      sendJson(res, 200, readQuestions(normalizeTopic(requestUrl.searchParams.get('topic'))));
    } catch (_error) {
      sendJson(res, 400, { message: 'A valid topic query parameter is required.' });
    }
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/submit') {
    try {
      const { questionId, selectedIndex, topic } = await readJsonBody(req);
      const question = readQuestions(normalizeTopic(topic)).find((entry) => entry.id === Number(questionId));

      if (!question) {
        sendJson(res, 400, {
          correct: false,
          feedback: 'Question not found.'
        });
        return;
      }

      const correct = question.correctIndex === Number(selectedIndex);
      sendJson(res, 200, {
        correct,
        feedback: correct ? 'Correct!' : 'Incorrect. Try again.',
        explanation: correct ? question.explanation : null
      });
    } catch (_error) {
      sendJson(res, 400, {
        correct: false,
        feedback: 'Invalid request payload.'
      });
    }
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/submit-all') {
    try {
      const { answers, topic } = await readJsonBody(req);
      const submittedAnswers = Array.isArray(answers) ? answers : [];
      const questionsById = new Map(
        readQuestions(normalizeTopic(topic)).map((question) => [question.id, question])
      );

      let correctAnswers = 0;
      for (const answer of submittedAnswers) {
        const question = questionsById.get(Number(answer.questionId));
        if (question && question.correctIndex === Number(answer.selectedIndex)) {
          correctAnswers += 1;
        }
      }

      const totalQuestions = submittedAnswers.length;
      const percentage = totalQuestions === 0 ? 0 : (correctAnswers * 100) / totalQuestions;

      sendJson(res, 200, {
        totalQuestions,
        correctAnswers,
        percentage,
        message: `You scored ${correctAnswers} out of ${totalQuestions} (${percentage.toFixed(1)}%)`
      });
    } catch (_error) {
      sendJson(res, 400, {
        message: 'Invalid request payload.'
      });
    }
    return;
  }

  sendJson(res, 404, { message: 'Not found.' });
});

server.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
});

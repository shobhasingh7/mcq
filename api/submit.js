const { getJsonBody, readQuestions } = require('./_lib/questions');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const { questionId, selectedIndex } = await getJsonBody(req);
  const question = readQuestions().find((entry) => entry.id === Number(questionId));

  if (!question) {
    res.status(400).json({
      correct: false,
      feedback: 'Question not found.'
    });
    return;
  }

  const correct = question.correctIndex === Number(selectedIndex);
  res.status(200).json({
    correct,
    feedback: correct ? 'Correct!' : 'Incorrect. Try again.',
    explanation: correct ? question.explanation : null
  });
};

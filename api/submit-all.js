const { getJsonBody, readQuestions } = require('./_lib/questions');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const payload = await getJsonBody(req);
  const submittedAnswers = Array.isArray(payload.answers) ? payload.answers : [];
  const questionsById = new Map(readQuestions().map((question) => [question.id, question]));

  let correctAnswers = 0;

  for (const answer of submittedAnswers) {
    const question = questionsById.get(Number(answer.questionId));
    if (question && question.correctIndex === Number(answer.selectedIndex)) {
      correctAnswers += 1;
    }
  }

  const totalQuestions = submittedAnswers.length;
  const percentage = totalQuestions === 0 ? 0 : (correctAnswers * 100) / totalQuestions;

  res.status(200).json({
    totalQuestions,
    correctAnswers,
    percentage,
    message: `You scored ${correctAnswers} out of ${totalQuestions} (${percentage.toFixed(1)}%)`
  });
};

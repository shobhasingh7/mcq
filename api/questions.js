const { normalizeTopic, readQuestions } = require('./_lib/questions');

module.exports = function handler(req, res) {
  try {
    const topic = normalizeTopic(req.query?.topic);
    res.status(200).json(readQuestions(topic));
  } catch (_error) {
    res.status(400).json({ message: 'A valid topic query parameter is required.' });
  }
};

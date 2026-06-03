const { readQuestions } = require('./_lib/questions');

module.exports = function handler(_req, res) {
  res.status(200).json(readQuestions());
};

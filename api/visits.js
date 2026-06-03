const { incrementVisitCount } = require('./_lib/visits');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  res.status(200).json({
    count: incrementVisitCount()
  });
};

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const errorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Token invalid/Not provided',
    });
  }
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "Endpoint doesn't exist" });
};

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    req.token = auth.replace('Bearer ', '');
  }

  next();
};

const userExtractor = async (req, res, next) => {
  try {
    const token = jwt.verify(req.token, process.env.SECRET);
    const user = await User.findById(token.id);
    req.user = user;
  } catch (e) {
    console.log(e);
  }
  next();
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
};

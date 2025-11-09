const userRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

userRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
  });
  res.json(users);
});

userRouter.post('/', async (req, res) => {
  const data = req.body;

  if (data.username.length < 3 || data.passwordHash.length < 3) {
    return res.status(400).json({
      error: 'Username and Password should be at least 3 characters long.',
    });
  }

  const SALTROUNDS = 10;
  data.passwordHash = await bcrypt.hash(data.passwordHash, SALTROUNDS);

  const newUserObject = User(data);
  const newUser = await newUserObject.save();

  return res.status(201).json(newUser);
});

module.exports = userRouter;

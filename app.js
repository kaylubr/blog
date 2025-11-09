const express = require('express');
const config = require('./utils/config');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const blogRouter = require('./controllers/blog');
const loginRouter = require('./controllers/login');
const userRouter = require('./controllers/users');

const app = express();

const mongoUrl = config.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose.connect(mongoUrl);

app.use(express.json());
app.use(middleware.tokenExtractor);

app.use('/api/blogs', blogRouter);
app.use('/api/login', loginRouter);
app.use('/api/users', userRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

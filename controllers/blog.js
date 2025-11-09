const blogRouter = require('express').Router();
const { userExtractor } = require('../utils/middleware');
const Blog = require('../models/blog');
const Comment = require('../models/comment')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
    .populate('comments')
  response.json(blogs);
});

blogRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', {
      username: 1,
      name: 1,
    })
    .populate('comments')
  response.json(blog);
});

blogRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const body = request.body;

    if (!body.title || !body.url) {
      return response.status(400).end();
    }

    const user = request.user;

    if (!user) {
      return res.status(400).json({
        error: 'Invalid Token',
      });
    }

    const blog = new Blog({
      url: body.url,
      title: body.title,
      author: body.author,
      user: user._id,
      likes: body.likes || 0,
    });

    const result = await blog.save();

    user.blogs = user.blogs.concat(result._id);
    await user.save();

    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

blogRouter.delete('/:id', userExtractor, async (req, res, next) => {
  try {
    const blogToDelete = await Blog.findById(req.params.id);
    const user = req.user;

    if (user._id.toString() !== blogToDelete.user.toString()) {
      return res.status(401).json({
        error: 'Users can only delete their own blogs',
      });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

blogRouter.put('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id);

    if (!blog) {
      return res.status(404).end();
    }

    const { likes } = req.body;

    blog.likes = likes + 1;

    const result = await blog.save();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

blogRouter.post('/:id/comments', async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id)
    if (!blog) {
      return res.status(404).end()
    }
    const payload = req.body
  
    const newComment = new Comment({ comment: payload.comment })
    const savedComment = await newComment.save()

    blog.comments = blog.comments.concat(savedComment)

    res.status(201).json(await blog.save())
  } catch (e) {
    next(e)
  }
})

module.exports = blogRouter;

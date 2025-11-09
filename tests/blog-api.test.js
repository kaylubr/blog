const app = require('../app');
const { after, beforeEach, test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test-helper');
const Blog = require('../models/blog');
const User = require('../models/user');

const request = supertest(app);

describe('when a user sends a request', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
    await User.deleteMany({});
    const user = await request.post('/api/users').send(helper.initialAcc);
    await Blog.find({}).updateMany({ user: user.body.id });
  });

  describe('viewing a blog', () => {
    test('succesfully show all of the blogs', async () => {
      const response = await request.get('/api/blogs');
      assert.strictEqual(response.body.length, helper.initialBlogs.length);
    });

    test('successfully show the correct blog specified by id', async () => {
      const blogList = await helper.blogsInDb();
      const firstBlog = blogList[0];

      const singleBlog = await request.get(`/api/blogs/${firstBlog.id}`);

      assert.deepStrictEqual(singleBlog, singleBlog);
    });
  });

  describe('adding a blog', () => {
    test('successfully adds the blog in the DB', async () => {
      const newBlog = { title: 'Foo', author: 'Bar', url: 'Baz', likes: 20 };
      const validUser = { username: 'testAcc', password: 'bar' };

      const response = await request.post('/api/login').send(validUser);

      await request
        .post('/api/blogs')
        .set('Authorization', `Bearer ${response.body.token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const blogAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogAtEnd.length, helper.initialBlogs.length + 1);

      const blogs = blogAtEnd.map((b) => b.url);
      assert(blogs.includes(newBlog.url));
    });

    test('successfully set the likes to a default value of 0', async () => {
      const newBlog = { title: 'Foo', author: 'Bar', url: 'Baz' };
      const validUser = { username: 'testAcc', password: 'bar' };
      const LIKES = 0;

      const response = await request.post('/api/login').send(validUser);

      const postedBlog = await request
        .post('/api/blogs')
        .set('Authorization', `Bearer ${response.body.token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(postedBlog.body.likes, LIKES);
    });

    test('fails with a status code of 400 BAD REQUEST when title is missing', async () => {
      const newBlog = { author: 'Bar', url: 'Baz', likes: 10 };
      const validUser = { username: 'testAcc', password: 'bar' };
      const EXPECTED_STATUS_CODE = 400;

      const response = await request.post('/api/login').send(validUser);

      await request
        .post('/api/blogs')
        .set('Authorization', `Bearer ${response.body.token}`)
        .send(newBlog)
        .expect(EXPECTED_STATUS_CODE);
    });

    test('fails with a status code of 400 BAD REQUEST when url is missing', async () => {
      const newBlog = { title: 'Foo', author: 'Bar', likes: 10 };
      const validUser = { username: 'testAcc', password: 'bar' };
      const EXPECTED_STATUS_CODE = 400;

      const response = await request.post('/api/login').send(validUser);

      await request
        .post('/api/blogs')
        .set('Authorization', `Bearer ${response.body.token}`)
        .send(newBlog)
        .expect(EXPECTED_STATUS_CODE);
    });

    test('fails with a status code of 401 if token is invalid/none', async () => {
      const newBlog = { title: 'Foo', author: 'Bar', url: 'Baz', likes: 20 };

      await request.post('/api/blogs').send(newBlog).expect(401);
    });
  });

  describe('deleting a blog', () => {
    test('successfully deletes a blog', async () => {
      const validUser = { username: 'testAcc', password: 'bar' };
      const blogsBefore = await helper.blogsInDb();
      const blogToDelete = blogsBefore[0];

      const response = await request.post('/api/login').send(validUser);

      await request
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${response.body.token}`)
        .expect(204);
      const blogsAfter = await helper.blogsInDb();

      assert.strictEqual(blogsAfter.length, blogsBefore.length - 1);
    });
  });

  describe('updating a blog', () => {
    test('successfully update the likes of a blog', async () => {
      const blogsBefore = await helper.blogsInDb();
      const blogToUpdate = blogsBefore[0];
      blogToUpdate.user = blogToUpdate.user.toString();
      blogToUpdate.likes += 1;

      const updatedBLog = await request
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate);

      assert.deepStrictEqual(updatedBLog.body, blogToUpdate);
    });

    test("fails if blog isn't found", async () => {
      const fakeId = await helper.generateFakeId();
      await request.put(`/api/blogs/${fakeId}`).send({}).expect(404);
    });
  });
});

describe('when trying to create a user', () => {
  test('fails when the username or password length is less than 3', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUserObject = {
      username: 'fo',
      name: 'bar',
      passwordHash: 'ba',
    };

    await request
      .post('/api/users')
      .send(newUserObject)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtStart.length, usersAtEnd.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});

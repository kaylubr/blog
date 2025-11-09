const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const summation = (sum, current) => {
    return sum + current.likes;
  };

  return blogs.length === 0 ? 0 : blogs.reduce(summation, 0);
};

const favoriteBlogs = (blogs) => {
  let highest = blogs[0];
  blogs.forEach((blog) => {
    if (blog.likes > highest.likes) {
      highest = blog;
    }
  });
  return highest;
};

const mostBlogs = (blogs) => {
  const blogCounts = _.countBy(blogs, (blog) => blog.author);
  const list = _.transform(
    blogCounts,
    (array, value, key) => {
      array.push({ author: key, blogs: value });
    },
    [],
  );

  return _.maxBy(list, (author) => author.blogs);
};

const mostLikes = (blogs) => {
  const grouped = _.groupBy(blogs, 'author');
  const likeCount = _.transform(
    grouped,
    (array, value, key) => {
      const obj = {
        author: key,
        likes: _.sumBy(value, (blog) => blog.likes),
      };
      array.push(obj);
    },
    [],
  );

  return _.maxBy(likeCount, (obj) => obj.likes);
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlogs,
  mostBlogs,
  mostLikes,
};

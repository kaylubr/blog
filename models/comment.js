const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  comment: String,
});

commentSchema.set('toJSON', {
  transform: (document, req) => {
    req.id = req._id.toString();
    delete req._id;
    delete req.__v;
  },
});

module.exports = mongoose.model('Comment', commentSchema);

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
});

userSchema.set('toJSON', {
  transform: (doc, requestObj) => {
    requestObj.id = requestObj._id;
    delete requestObj._id;
    delete requestObj.__v;
    delete requestObj.passwordHash;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

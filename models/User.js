const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const { ObjectID } = require('mongodb');

const bcryptSalt = promisify(bcrypt.genSalt);
const bcryptHash = promisify(bcrypt.hash);
const bcryptCompare = promisify(bcrypt.compare);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: 2,
      trim: true,
      required: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  { timestamps: true }
);

// Called when we want to return User from API Call
UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();

  return {
    _id: userObject._id,
    username: userObject.username
  };
};

UserSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    const salt = await bcryptSalt(13);
    const hash = await bcryptHash(user.password, salt);
    user.password = hash;
  }

  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

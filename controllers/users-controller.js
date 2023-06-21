const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const gravatar = require('gravatar');

const path = require('path');

const Jimp = require('jimp');

const { User } = require('../models/user');

const { HttpError } = require('../helpers');

const { ctrlWrapper } = require('../decorators');

const { SECRET_KEY } = process.env;

const fs = require('fs/promises');

const avatarsDir = path.resolve('public', 'avatars');

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, 'Email already in use');
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarUrl = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarUrl,
  });
  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
    avatarUrl,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    user: {
      token,
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const logOut = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });
  res.status(204).json({
    message: 'No Content',
  });
};

const updateSubscription = async (req, res, next) => {
  const { _id } = req.user;
  const newStatus = await User.findByIdAndUpdate(
    _id,
    { subscription: req.body.subscription },
    { new: true }
  );
  if (!newStatus) {
    throw HttpError(404, 'Not found');
  }
  res.json(newStatus);
};

const updateAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const photoUser = await Jimp.read(tmpUpload);
    await photoUser.cover(250, 250).writeAsync(tempUpload);
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  logOut: ctrlWrapper(logOut),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};

const express = require('express');

const { validateBody, authenticate, upload } = require('../../middlewares');
const { schemas } = require('../../models/user');

const usersController = require('../../controllers/users-controller');

const router = express.Router();

router.post(
  '/register',
  validateBody(schemas.registerSchema),
  usersController.register
);

router.post('/login', validateBody(schemas.loginSchema), usersController.login);

router.get('/current', authenticate, usersController.getCurrentUser);

router.post('/logout', authenticate, usersController.logOut);

router.patch(
  '/',
  authenticate,
  validateBody(schemas.subscriptionSchema),
  usersController.updateSubscription
);

router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  usersController.updateAvatar
);

module.exports = router;

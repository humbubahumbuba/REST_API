const express = require('express');

const { validateBody } = require('../../middlewares');
const { schemas } = require('../../models/user');

const usersController = require('../../controllers/users-controller');

const router = express.Router();

// route.use(authenticate);

router.post(
  '/register',
  validateBody(schemas.registerSchema),
  usersController.register
);
router.post('/login', validateBody(schemas.loginSchema), usersController.login);

module.exports = router;

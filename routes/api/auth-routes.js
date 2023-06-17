const express = require('express');

const { validateBody } = require('../../middlewares');
const { schemas } = require('../../models/user');

const usersController = require('../../controllers/users-controller');

const router = express.Router();

router.post(
  '/register',
  validateBody(schemas.registerSchema),
  usersController.register
);

module.exports = router;

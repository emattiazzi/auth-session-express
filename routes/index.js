const { promisify } = require('util');
const router = require('express').Router();
const UserController = require('../controllers/UserController.js');
const { authenticate } = require('../middlewares/UserMiddleware.js');
const { catchErrors } = require('../helpers/Utils');

router.get('/users', authenticate, catchErrors(UserController.findAll));
router.post('/users', catchErrors(UserController.create));
router.get('/users/me', authenticate, catchErrors(UserController.findByToken));
router.post('/users/login', catchErrors(UserController.login));
router.get(
  '/users/:userId',
  authenticate,
  catchErrors(UserController.findById)
);
router.put('/users/:userId', authenticate, catchErrors(UserController.update));
router.patch(
  '/users/:userId',
  authenticate,
  catchErrors(UserController.updateFields)
);
// router.delete('/users/:userID')

module.exports = router;

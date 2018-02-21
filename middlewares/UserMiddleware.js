const User = require('../models/User');

exports.authenticate = async function authenticate(req, res, next) {
  if (
    req.session &&
    req.session.key &&
    (await User.findOne({ _id: req.session.key }))
  )
    return next();
  else return res.status(401).json('NOT_AUTHORIZED');
};

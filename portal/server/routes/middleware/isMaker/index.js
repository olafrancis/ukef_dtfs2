const { MAKER } = require('../../../constants/roles');

const isMaker = async (req, res, next) => {
  const { user } = req.session;

  if (!user || !user.roles.includes(MAKER)) {
    return res.redirect('/');
  }

  return next();
};

module.exports = isMaker;

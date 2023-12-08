const account = require('./controllers/Account');
const mid = require('./middleware');

const router = (app) => {
  app.post('/login', mid.requiresSecure, mid.requiresLogout, account.login);

  app.get('/', mid.requiresSecure, mid.requiresLogout, (req, res) => res.render('index'));
};

module.exports = router;

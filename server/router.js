const account = require('./controllers/Account');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, account.login);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;

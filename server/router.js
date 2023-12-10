const account = require('./controllers/Account');
const mid = require('./middleware');

const router = (app) => {
  // Functions that handle signing in/out
  app.post('/login', mid.requiresSecure, mid.requiresLogout, account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, account.signup);
  app.get('/logout', mid.requiresLogin, account.logout);

  // This essentially just checks if the user is logged in
  app.get('/menu', (req, res) => {
    if (req.session.account) {
      return res.status(200).json({ loggedIn: true });
    }

    return res.status(200).json({ loggedIn: false });
  });

  app.get('/', mid.requiresSecure, (req, res) => res.render('index'));
};

module.exports = router;

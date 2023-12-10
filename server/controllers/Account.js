const models = require('../models');

const { Account } = models;

const logout = (req, res) => {
  req.session.destroy();

  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/menu' });
  });
};

const signup = async (req, res) => {
  console.log(Account);
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    console.log('Check 1');
    const hash = await Account.generateHash(pass);
    console.log('Check 2');
    const newAccount = new Account({ username, password: hash });
    console.log('Check 3');
    await newAccount.save();
    console.log('Check 4');
    req.session.account = Account.toAPI(newAccount);
    console.log('Check 5');
    return res.json({ redirect: '/menu' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

module.exports = {
  login,
  logout,
  signup,
};

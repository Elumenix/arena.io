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

    return res.status(200).json({ loggedIn: true });
  });
};

const signup = async (req, res) => {
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
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.status(200).json({ loggedIn: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const updateHigh = async (req, res) => {
  const username = `${req.body.username}`;
  const score = `${req.body.score}`;

  try {
    const account = await Account.findOne({ username });
    if (!account) {
      return res.status(400).json({ error: 'No account found for this username!' });
    }

    if (score > account.highScore) {
      account.highScore = score;
      await account.save();
      return res.status(200).json({ message: 'High score updated successfully!', score });
    }
    return res.status(200).json({
      message: 'Score is not higher than the current high score.',
      score: account.highScore,
    });
  } catch (err) {
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

module.exports = {
  login,
  logout,
  signup,
  updateHigh,
};

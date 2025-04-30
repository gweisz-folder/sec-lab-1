const express = require("express");
const { expressjwt } = require("express-jwt");
const jwt = require('jsonwebtoken');
var cors = require('cors')

const { articles } = require("./articles.js");
const { users } = require("./users.js");

const SECRET_KEY = 'someRandomSecretKey';
const PORT = 3000;

// Used as a sequence to generate new articles ID
let MAX_ID = articles.reduce(function(prev, current) {
  if (current.id > prev.id) {
      return current;
  } else {
      return prev;
  }
}).id;

const app = express();
app.use(express.json());
app.use(cors())

function generateToken(user) {
  const customClaims = {
    username: user.username,
    role: user.role,
  };

  const options = {
    expiresIn: '12h',
    algorithm: 'HS256',
  };

  // Generate and return the token
  return jwt.sign(customClaims, SECRET_KEY, options);
}

function checkWriter(req, res, next) {
  if (req.auth?.role !== 'Writer') {
    return res.status(401).send('User must be a writer');
  }

  next();
}

function getUserRole(req) {
  return req?.auth?.role;
}

app.get("/articles",
  expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
  (req, res) => {
    const role = getUserRole(req);

    if ((role === 'Reader') || (role === 'Writer')) {
      return res.send(articles);
    }

    // Guest
    const response = [];

    for (const article of articles) {
      if (!article.paid) {
        response.push(article);
      }
    }

    return res.send(response);
  });

app.get("/articles/:id",
  expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
  (req, res) => {
    const article = articles.find((a) => a.id == req.params.id);

    if (!article) {
      return res.status(404).send();
    }

    if (!article.paid) {
      return res.send(article);
    }

    const role = getUserRole(req);

    // Guest shouldn't be here...
    if ((role === 'Guest') || (role === 'Reader') || (role === 'Writer')) {
      return res.send(article);
    }

    return res.status(401).send();
  });

app.post("/articles/",
  expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
  checkWriter,
  (req, res) => {
    const subject = req.body?.subject;
    const content = req.body?.content;

    if (!subject) {
      return res.status(400).send('Please provide a valid subject');
    }
    if (!content) {
      return res.status(400).send('Please provide a valid content');
    }

    MAX_ID += 1;

    const newArticle = {
      id: MAX_ID,
      paid: true,
      subject,
      content
    };

    articles.push(newArticle);

    return res.send(newArticle);
  });

app.put("/articles/:id",
  expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
  // checkWriter mw should be enabled...
  // checkWriter,
  (req, res) => {
    const article = articles.find((a) => a.id == req.params.id);

    if (!article) {
      return res.status(404).send();
    }

    const subject = req.body?.subject;
    const content = req.body?.content;

    if (!subject) {
      return res.status(400).send('Please provide a valid subject');
    }
    if (!content) {
      return res.status(400).send('Please provide a valid content');
    }

    article.subject = subject;
    article.content = content;

    return res.send(article);
  });

app.delete("/articles/:id",
  // No authentication check?!
  // expressjwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
  // checkWriter,
  (req, res) => {
    const articleIdx = articles.findIndex((a) => a.id == req.params.id);
    const article = articles.at(articleIdx);

    if (articleIdx === -1) {
      return res.status(404).send();
    }

    articles.splice(articleIdx, 1);
    return res.send(article);
  });

app.post("/login", (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username) {
    return res.status(400).send("Please provide a valid username");
  }
  if (!password) {
    return res.status(400).send("Please provide a valid password");
  }

  const user = users.find((u) => u.username == username);

  if (!user) {
    return res.status(401).send("Invalid user");
  }
  if (user.password !== password) {
    return res.status(401).send("Invalid user");
  }

  console.log('Valid login for user', username);
  res.send(generateToken(user));
});

app.listen(PORT, () => {
  console.log(`Security lab server listening on port ${PORT}`);
  console.log('Max ID: ', MAX_ID);
});

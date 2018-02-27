const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const helmet = require('helmet')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(helmet());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',
  store: new redisStore({ host: 'localhost', port: 6379, ttl: 260 }),
  saveUninitialized: false,
  resave: false,
  cookie: {
    expires: 8*60*60*1000,
    httpOnly: true
  }
})
);
app.use(require('morgan')('dev'));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);
mongoose.set('debug', true);

app.get('/', (req, res) => {
  res.sendFile('index.html');
})

app.use(require('./routes'));

const displayErrors = async (err, req, res, next) => {
  res.status(err.status || 500).json({ message: 'INTERNAL_ERROR' });
};

app.use(displayErrors);

app.listen(process.env.PORT || 3000, function () {
  console.log('Server has started');
});

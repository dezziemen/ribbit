const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const mongoose = require('mongoose');
const mongoSession = require('connect-mongo');
const config = require('dotenv').config();
// var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const userServicesRouter = require('./routes/userServices');
const homeRouter = require('./routes/home')
const app = express();
// const mongoString = process.env.DATABASE_URL;
// const sessionSecret = process.env.SESSION_SECRET;
const {
  NODE_ENV = 'development',
  DATABASE_URL,
  SESSION_NAME = 'sid',
  SESSION_SECRET = 'green cat',
  SESSION_TIMEOUT = 1000 * 60 * 60 * 3
} = process.env;

const IN_PRODUCTION = NODE_ENV === 'production';

mongoose.connect(DATABASE_URL);
database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  store: mongoSession.create({
      mongoUrl: DATABASE_URL,
      autoRemove: 'native',
      collectionName: 'sessions',
  }),
  cookie: {
    maxAge: Number(SESSION_TIMEOUT),
    sameSite: true,
    secure: IN_PRODUCTION,
  },
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/', homeRouter);
app.use('/u', usersRouter);
app.use('/api/u', userServicesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

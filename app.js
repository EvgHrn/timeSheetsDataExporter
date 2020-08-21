const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const cron = require('node-cron');
const Ftp = require('./utils/ftp');

require("dotenv").config();

cron.schedule('*/60 * * * *', () => {
    console.log('running a task every ten minutes');
    Ftp.uploadDataFile('data.xlsx');
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;

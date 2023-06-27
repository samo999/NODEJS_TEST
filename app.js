let likes = 0;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const http = require('http');
const events = require('events');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
/////////////////////
const { Server } = require('socket.io');
const server = http.createServer(app);
//////////////////////
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/////////////////////////////////////////////////////////////
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});
const eventEmitter = new events.EventEmitter();
setInterval(() => {
  likes++;
  eventEmitter.emit('newdata');}, 2000);
io.on('connection', (socket) => {
  socket.emit('likeupdate', likes);
  socket.on('likes', () => {
    likes++;
    socket.emit('likeupdate', likes);
    socket.broadcast.emit('likeupdate', likes);
  });
  eventEmitter.on('newdata', () => { socket.broadcast.emit('likeupdate', likes); });
});
//server.listen(3000);
/////////////////////////////////////
module.exports = app,likes;

var express = require('express'),
app = express(),
port = process.env.PORT || 8080,
mongoose = require('mongoose'),
MongoStore = require('connect-mongo')(express),
ioSession = require('socket.io-session'),
io = require('socket.io').listen(app.listen(port));

var sessionKey = 'secret key'
var memoryStore = new MongoStore({ db: 'mongodb', url: 'mongodb://localhost/whisperchat' });

app.use(express.cookieParser());
app.use(express.session({ secret: sessionKey, store: memoryStore }));

require('./config')(app, io);
require('./routes')(app, io);

console.log('WhisperChat is running on http://localhost:' + port);
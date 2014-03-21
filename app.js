var express = require('express'),
app = express(),
port = process.env.PORT || 8080,
mongoose = require('mongoose'), 
io = require('socket.io').listen(app.listen(port));



require('./config')(app, io);
require('./routes')(app, io);

console.log('WhisperChat is running on http://localhost:' + port);
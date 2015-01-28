var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var config = require('config');

var api = require('./src/api')(app);

app.listen(config.port).on('listening', function() {
	console.log("server started on ", config.port);
});

module.exports = app;
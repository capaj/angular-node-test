var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var config = require('config');
var morgan  = require('morgan');
app.use(morgan('combined'));
app.use(express.static('./public/'));

var MongoClient = require('mongodb').MongoClient;

app.readyCB = function() {};

MongoClient.connect(config.mongo, function(err, db) {
	if (err) {
		throw err;
	}
	app.readyCB(db);
	console.log("Connected correctly to mongo");
	var api = require('./src/api')(app, db);

	app.listen(config.port).on('listening', function() {
		console.log("server started on ", config.port);
	});
});



module.exports = app;
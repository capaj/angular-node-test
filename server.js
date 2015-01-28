var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var config = require('config');
var users = require('./data/default-users.json');
var _ = require('lodash');

var hat = require('hat');

/**
 * holds active tokens
 * @type {Array<String>}
 */
var loggedInTokens = [];

app.listen(config.port).on('listening', function() {
	console.log("server started on ", config.port);
});

app.post('/auth', function(req, res) {
	var user =_.find(users, req.body);
	//TODO store in mongo
	if (user) {
		var token = hat();
		loggedInTokens.push(token);
		res.status(201).send(token)
	} else {
		res.send(401);
	}
});

app.delete('/auth/:token', function(req, res){
	var index = loggedInTokens.indexOf(req.token);
	if (index !== -1) {
		loggedInTokens.splice(index, 1);
		res.send(200);
	} else {
		res.send(404);
	}

});

module.exports = app;
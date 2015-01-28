var hat = require('hat');
var _ = require('lodash');
var users = require('../data/default-users.json');

/**
 * holds active tokens
 * @type {Array<String>}
 */
var loggedInTokens = [];

module.exports = function(app) {
	app.post('/auth', function(req, res) {
		var input = req.body;
		input.name = input.name.toLowerCase();
		var user =_.find(users, input);	//we expect that our names are stored lowercased
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
};
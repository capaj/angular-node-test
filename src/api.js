var hat = require('hat');
var _ = require('lodash');
var users = require('../data/default-users.json');
var actions = require('./actions');
/**
 * holds active tokens
 * @type {Array<String>}
 */
var loggedInTokens = [];

/**
 * @param {Object} app express app
 * @param {Object} db mongo db instance
 */
module.exports = function(app, db) {
	var collection = db.collection('attempts');

	app.post('/auth', function(req, res) {
		var input = req.body;
		input.name = input.name.toLowerCase();

		var user =_.find(users, input);	//we expect that our names are stored lowercased
		var attempt = {
			ip: req.ip,
			datetime: new Date()
		};
		if (user) {
			attempt.user = user.name;
			attempt.action = actions.ok;
			var token = hat();
			loggedInTokens.push(token);
			res.status(201).send(token)
		} else {
			attempt.action = actions.fail;
			res.sendStatus(401);
		}

		collection.insert(attempt, function(err, result) {
			if (err) {
				console.log("error while saving to mongo", err);
			}
		});

	});

	app.delete('/auth/:token', function(req, res){
		var index = loggedInTokens.indexOf(req.params.token);
		if (index !== -1) {
			loggedInTokens.splice(index, 1);
			res.sendStatus(200);
		} else {
			res.sendStatus(404);
		}

	});
};
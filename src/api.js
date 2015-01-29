var hat = require('hat');
var _ = require('lodash');
var users = require('../data/default-users.json');
var actions = require('./actions');

/**
 * holds active tokens
 * @type {Array<String>}
 */
var loggedInTokens = [];
var connectedSockets = [];
/**
 * @param {Object} app express app
 * @param {Object} db mongo db instance
 */
module.exports = function(app, db) {
	var server = require('http').Server(app);
	var io = require('socket.io')(server);

	io.on('connection', function (socket) {
		connectedSockets.push(socket);
	});

	io.on('disconnect', function (socket) {
		connectedSockets.splice(connectedSockets.indexOf(socket), 1);
	});

	io.use(function(socket, next) {
		var token;
		try {
			token = socket.handshake.query.token;
			if (loggedInTokens.indexOf(token) !== -1) {
				return next();
			} else {
				return next(new Error('Not authorized'));
			}
		} catch (err) {
			next(err);
		}

	});

	var collection = db.collection('attempts');

	app.post('/auth', function(req, res) {
		var input = req.body;

		var attempt = {
			ip: req.ip,
			datetime: new Date(),
			action: actions.fail,
			user: 'unknown'
		};

		if (input.name === undefined || input.password === undefined) {
			res.sendStatus(400);
		} else {
			input.name = input.name.toLowerCase();

			var user = _.find(users, input);	//we expect that our names are stored lowercased

			if (user) {
				attempt.user = user.name;
				attempt.action = actions.ok;
				var token = hat();
				loggedInTokens.push(token);
				res.status(201).send(token)
			} else {
				res.sendStatus(401);
			}
		}

		collection.insert(attempt, function(err, result) {
			if (err) {
				console.log("error while saving to mongo", err);
			}
		});

		connectedSockets.forEach(function (socket){
			socket.emit('attempt', attempt);
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
	return server;
};
var server = require('../server');
var request = require('supertest-as-promised');
var users = require('../data/default-users.json');
var Promise = require('bluebird');
var actions = require('../src/actions');
require('chai').should();

/**
 * @param {Object} user
 * @returns {Promise}
 * @param {Number} [resCode] if not provided, expects 200
 */
function makeAuthReq(user, resCode) {
	return request(server)
		.post('/auth')
		.send(user)
		.expect(resCode || 201);
}

describe('simple auth api.spec', function(){
	var db;
	var token;

	before(function(done) {
		server.readyCB = function(database) {
			db = database;
			done();
		};
	});

	it('should authenticate for known users', function(){
		var allTestedPromises = users.map(function(user) {
			return makeAuthReq(user);
		});
		return Promise.all(allTestedPromises);
	});

	it('should authenticate for a known user with mismatched casing', function(){
		var user = users[0];
		var allUpperCaseName = user.name.toUpperCase();
		return makeAuthReq({name: allUpperCaseName, password: user.password}).then(function(res){
		   token = res.text;	//well use this token in subsequent tests
		});
	});

	it('should NOT authenticate for an unknown user', function(){
		var user = {name: 'john.smith', password: 'sss'};
		return makeAuthReq(user, 401);
	});

	it('should NOT authenticate for known user with wrong password', function() {
		var user = {name: users[0].name, password: ''};
		return makeAuthReq(user, 401);
	});
	
	it('should be able to logout a user who logged in', function(){
		return request(server)
			.delete('/auth/' + token)
			.expect(200);
	});

	it("should 400 when data posted don't have username or password", function(){
		var user1 = {password: ''};
		var user2 = {name: 'john.smith'};
		return makeAuthReq(user1, 400).then(function() {
			return makeAuthReq(user2, 400);
		});
	});

	it('should 404 when a user attempts to logout who is not logged in(anymore)', function() {
		return Promise.all([
			request(server)
				.delete('/auth/' + token)
				.expect(404),
			request(server)
				.delete('/auth/aaathistokenisfake')
				.expect(404)
		]);
	});

	describe('storing attempts feature', function() {
		it('should record any authentication attempt in mongo with the right action', function(done) {
			db.collection('attempts', function(err, collection) {
				//TODO promisify and use promise.all
				collection.find({action: actions.ok}).count(function(err, count) {
					count.should.equal(6);
					collection.find({action: actions.fail}).count(function(err, count) {
						count.should.equal(4);
						done();
					});
				});
			});
		});

	});

	describe('live feed feature', function(){
		this.timeout(5000);
		var socket;
		var io = require('socket.io-client');

		before(function(done) {
			return makeAuthReq(users[0]).then(function(res){
				token = res.text;	//well use this token in subsequent tests
				socket = io('http://localhost:8050', {
					query: 'token=' + token
				});
				done()
			});
		});

		it('should send a client socket.io events for every login attempt', function(done){

			var c = 0; //counter
			socket.on('attempt', function(data) {
				c++;
				if (c === 2) {
					done()
				}
			});

			socket.on('connect', function() {
				console.log("connects");
				Promise.all(users.map(function(user) {
					return makeAuthReq(user)
				})).then(function() {
					return makeAuthReq({name: 'fail', password: 'fail'}, 401);
				});
			});

		});
	});

	after(function(done) {
		db.collection('attempts', function(err, collection) {
			if (err) {
				throw err;
			}
			collection.remove({}, function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	})

});
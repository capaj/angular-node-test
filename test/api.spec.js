//var socket = require('socket.io-client')('http://localhost:8050');
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
		this.timeout = 10000;
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
		var user = {name: 'john.smith', password: ''};
		return makeAuthReq(user, 401);
	});

	it('should NOT authenticate for known user with wrong password', function(){
		var user = {name: users[0].name, password: ''};
		return makeAuthReq(user, 401);
	});
	
	it('should be able to logout a user who logged in', function(){
		return request(server)
			.delete('/auth/' + token)
			.expect(200);
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
				collection.find({action: actions.ok}).count(function(err, count) {
					count.should.equal(6);
					collection.find({action: actions.fail}).count(function(err, count) {
						count.should.equal(2);
						done();
					});
				});
			});
		});

	});

	describe.skip('live feed feature', function(){
		it('should send us a new socket.io event so that clients live feed works', function(){
			var c = 0; //counter
			socket.on('attempt', function(data) {
				c++;
			});



			return Promise.all(users.map(makeAuthReq)).then(function() {
				c.should.equal(users.length + 1);
			});

		});
	});

	after(function(done) {
		db.collection('attempts', function(err, collection) {
			if (err) {
				throw err;
			}
			collection.remove({}, function() {
				done();
			});
		});
	})

});
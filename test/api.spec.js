//var socket = require('socket.io-client')('http://localhost:8050');
var server = require('../server');
var request = require('supertest-as-promised');
var users = require('../data/default-users.json');
var Promise = require('bluebird');
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
		.expect(201 || resCode)
}

describe('simple auth api.spec', function(){
	it('should authenticate for known users', function(done){
		this.timeout = 10000;
		var allTestedPromises = users.map(makeAuthReq);
		Promise.all(allTestedPromises).then(function(responses) {
			done();
		});
	});

	it('should authenticate for a known user with mismatched casing', function(done){
		var user = users[0];
		var allUpperCaseName = user.name.toUpperCase();
		makeAuthReq({name: allUpperCaseName, password: user.password}).then(done);
	});

	it('should NOT authenticate for an unknown user', function(done){
		var user = {name: 'john.smith', password: ''};
		makeAuthReq(user, 401).then(done);
	});

	it('should NOT authenticate for known user with wrong password', function(done){
		var user = {name: users[0].name, password: ''};
		makeAuthReq(user, 401).then(done);
	});
	
	it('should be able to logout a user who logged in', function(){
		request(server)
			.delete('/auth/' + token)
			.expect(200);
	});

	it('should 404 when a user attempts to logout who is not logged in', function(){
		request(server)
			.delete('/auth/' + token)
			.expect(404);
	});

	describe.skip('recording of attempts', function(){
		it('should record any authentication attempt in mongo', function(){

		});

		it('should send us a new socket.io event so that clients live feed works', function(done){
			var c = 0; //counter
			socket.on('attempt', function(data) {
				c++;
			});



			Promise.all(users.map(makeAuthReq)).then(function() {
				c.should.equal(users.length + 1);
				done();
			});

		});
	});


});
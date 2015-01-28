var socket = require('socket.io-client')('http://localhost:8050');
var server = require('../server');
var request = require('supertest-as-promised');
var users = require('../data/default-users.json');
var Promise = require('bluebird');

/**
 * @param {Object} user
 * @returns {Promise}
 * @param {Number} [resCode] if not provided, expects 200
 */
function makeReq(user, resCode) {
	return request(server)
		.post('/auth')
		.send(user)
		.expect(200 || resCode)
}

describe('simple auth api.spec', function(){
	it('should authenticate for known users', function(done){
		var allTestedPromises = users.map(makeReq);
		Promise.all(allTestedPromises).then(done);
	});

	it('should authenticate for a known user with mismatched casing', function(done){
		var user = users[0];
		var allUpperCaseName = user.name.toUpperCase();
		makeReq({name: allUpperCaseName, password: user.password}).then(done);
	});

	it('should NOT authenticate for an unknown user', function(done){
		var user = {name: 'john.smith', password: ''};
		makeReq(user, 401).then(done);
	});

	it('should NOT authenticate for known user with wrong password', function(done){
		var user = {name: users[0].name, password: ''};
		makeReq(user, 401).then(done);
	});

	describe('recording of attempts', function(){
		it('should record any authentication attempt in mongo', function(){

		});

		it('should send us a new socket.io event so that clients live feed works', function(done){
			var c = 0; //counter
			socket.on('attempt', function(data) {
				c++;
			});

			Promise.all(users.map(makeReq)).then(function() {
				c.should.equal()
			});

		});
	});


});
var config = require('config'); //../../config/test.json'

describe('auth app', function() {
	beforeEach(function() {
		browser.get('http://localhost:' + config.port);
	});
	function logIn(name, pass) {
		element(by.model('name')).sendKeys(name);
		element(by.model('password')).sendKeys(pass);
		element(by.css('[ng-click]')).click();
	}

	it('should open a new modal when auth fails', function(){
		logIn('fail', '');
		expect(element(by.id('logoutBtn')).isPresent()).toBe(false);
		expect(element(by.css('md-dialog')).isPresent()).toBe(true);
	});

	it('should open a login modal which lets user log in and log out', function() {

		logIn('user', 'password');
		var todoList = element.all(by.repeater('attempt in attempts'));
		expect(todoList.count()).toEqual(0);
		var logoutBtn = element(by.id('logoutBtn'));
		expect(logoutBtn.isPresent()).toBe(true);
		logoutBtn.click();
		expect(element(by.css('md-dialog')).isPresent()).toBe(true);

	});


});
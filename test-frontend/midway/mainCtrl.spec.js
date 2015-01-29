require('../../public/main');
chai.should();

describe('mainCtrl', function() {
	var tester;

	beforeEach(function() {
		tester = ngMidwayTester('authApp', {});
	});

	afterEach(function() {
		tester.destroy();
		tester = null;
	});

	it('should show a login dialog straight on landing page', function(done) {
		tester.visit('/', function() {
			expect(tester.viewElement().html()).to.contain('Please provide your user details:');

			var scope = tester.viewScope();

			done();
		});
	});
	


});
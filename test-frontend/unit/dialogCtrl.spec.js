require('../../public/main');
chai.should();

describe('dialogCtrl', function() {
	var scope;
	var mdDialog;

	beforeEach(angular.mock.module('authApp'));

	beforeEach(inject(function($rootScope, $controller, $httpBackend, $mdDialog) {

		scope = $rootScope.$new();
		mdDialog = $mdDialog;
		$mdDialog.hide = sinon.spy();
		$controller('dialogCtrl', {$scope: scope});

	}));

	it('be able to hide the dialog upon login', function() {
		scope.name = 'user';
		scope.password = 'password';
		scope.login();
		mdDialog.hide.calledWith({name: 'user', password: 'password'}).should.be.ok;
	});

});


window.Hammer = require('hammer.js');
require('angular-material');

module.exports = angular.module('authApp', [
	'ngMaterial', 'ngAria', 'ngAnimate'
])
	.config(function($locationProvider) {
		$locationProvider.html5Mode(true);
	})
	.run(function($rootScope, $mdDialog) {
		$mdDialog.show({
			//controller: DialogController,
			templateUrl: 'templates/loginDlg.html'
		})
			.then(function(answer) {

			}, function() {

			});

	});
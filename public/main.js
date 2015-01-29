window.Hammer = require('hammer.js');
require('angular-material');
require('bower-angular-messages');
var io = require('socket.io-client');
var socket;

module.exports = angular.module('authApp', [
		'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages'
	]).config(function($locationProvider) {
		$locationProvider.html5Mode(true);
	})
	.factory('loginDlg', function($rootScope, $mdDialog, $http) {
		var showDlg = function() {
			return $mdDialog.show({
				clickOutsideToClose: false,
				controller: 'dialogCtrl',
				escapeToClose: false,
				templateUrl: 'templates/loginDlg.html'
			}).then(function(authObj) {
				return $http.post('/auth', authObj).then(function(res) {
					//user succesfully authorised
					$rootScope.token = res.data;
					socket = io.connect('http://localhost:8050', {
						query: 'token=' + res.data
					});
				}, showDlg);
			}, showDlg);
		};

		return showDlg;
	})
	.run(function(loginDlg) {
		loginDlg();

	}).controller('dialogCtrl', function($scope, $mdDialog) {
		$scope.login = function() {
			$mdDialog.hide({
				name: $scope.name,
				password: $scope.password
			});
		}
	}).controller('mainCtrl', function($scope, $http, loginDlg, $rootScope) {
		$scope.attempts = [];
		socket.on('attempt', function(data) {
			$scope.attempts.push(data);
			$scope.$apply();
		});

		$scope.logout = function() {
			$http.delete('/auth/' + $rootScope.token).then(function(){
			    $scope.token = null;
				$scope.attempts = [];
				socket.disconnect();
				loginDlg();
			});
		};

	});
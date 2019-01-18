(function() {
	"use strict";
	
	videoStation.controller("loginController", loginController);
	
	loginController.$inject = ["$scope", "UserFactory", "$location"];
	
	function loginController($scope, UserFactory, $location) {
		const vm = this;
		
		vm.loginUser = function() {
			
			vm.loadingClass = "is-loading";
			
			UserFactory.login(vm.email, vm.password)
			.then(response => {
				$location.path("/home");
			})
			.catch(error => {
				vm.errorLogin = error;
			})
			.then(function() {
				vm.loadingClass = "";
				$scope.$apply();
			});
		};
		
		vm.goRegister = function() {
			$location.path("/register");
		};
	}
	
})();
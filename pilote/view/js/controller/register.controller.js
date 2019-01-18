(function() {
	"use strict";
	
	videoStation.controller("registerController", registerController);
	
	registerController.$inject = ["$scope", "$location", "UserFactory"];
	
	function registerController($scope, $location, UserFactory) {
		const vm = this;
		
		vm.registerUser = function() {

			vm.loadingClass = "is-loading";
			
			UserFactory.register(vm.email, vm.password)
			.then(response => {
				$location.path("/login");
			})
			.catch(error => {
				vm.errorRegister = error;
			})
			.then(function() {
				vm.loadingClass = "";
				$scope.$apply();
			});
		};
		
		vm.goLogin = function() {
			$location.path("/login");
		};
		
	}
})();

(function() {
	"use strict";
	
	videoStation.controller("menuController", menuController);
	
	menuController.$inject = ["$scope", "$rootScope", "$location", "UserFactory"];
	function menuController($scope, $rootScope, $location, UserFactory) {
		const vm = this;

        vm.searchText = "";

		$scope.$watch(
			function() {
				return UserFactory.isLogged;
			},
			function(newVal, oldVal) {
				$scope.isLogged = newVal;
			}
		);

        $scope.$watch(
            function() {
                return UserFactory.isAdmin;
            },
            function(newVal, oldVal) {
                $scope.isAdmin = newVal;
            }
        );

		vm.search = function(){
            $location.path(`/search/${vm.searchText}`);
		};

		vm.goManageApplication = function(){
            $location.path("admin/application");
		};

		vm.goHome = function() {
      		$location.path("/");
    	};

        vm.goAccount = function() {
            $location.path("/account");
        };

		vm.goPlaylist = function (){
            $location.path("/playlists");
		};

		vm.goLogin = function() {
			$location.path("/login");
		};

		vm.goRegister = function() {
			$location.path("/register");
		};

		vm.logoutUser = function() {
			UserFactory.logout();
			vm.goLogin();
		};
		
	}
})();

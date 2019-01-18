(function() {
    "use strict";

    videoStation.controller("applicationController", applicationController);

    applicationController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory"];

    function applicationController($scope, $location, $routeParams, AdminFactory) {
        const vm = this;

        vm.goUser = function(user){
            $location.path(`admin/user/${user.id}`);
        };

        vm.goRegister = function(){
            $location.path("admin/register");
        };

        AdminFactory.all()
            .then(response => {
                console.log(response)
                vm.accounts = response.users;
            })
            .catch(error => {
                vm.errorAccounts = error;
            })
            .then(function() {
                $scope.$apply();
            });
    }
})();

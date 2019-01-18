(function() {
    "use strict";

    videoStation.controller("registerAdminController", registerAdminController);

    registerAdminController.$inject = ["$scope", "$location", "AdminFactory", "$mdToast"];

    function registerAdminController($scope, $location, AdminFactory, $mdToast) {
        const vm = this;

        vm.options = {};
        vm.form = {};
        vm.options.type = {
            available: [
                {name: 'Administrateur', value: 'ADMIN'},
                {name: 'Utilisateur', value: 'USER'}
            ]
        };
        vm.options.state = {
            available: [
                {name: 'Actif', value: true},
                {name: 'Inactif', value: false}
            ]
        };

        vm.state = vm.options.state.available[0];
        vm.type = vm.options.type.available[1];

        vm.registerUser = function() {
            vm.loadingClass = "is-loading";

            AdminFactory.register(vm.email, vm.password, vm.type.value, vm.state.value)
                .then(response => {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('User add!')
                            .position('bottom right')
                            .hideDelay(3000)
                    );
                    $location.path("/admin/application");
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

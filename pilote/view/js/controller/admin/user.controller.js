(function () {
    "use strict";

    videoStation.controller("userController", userController);

    userController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory", "$mdToast"];

    function userController($scope, $location, $routeParams, AdminFactory, $mdToast) {
        const vm = this;
        vm.id = $routeParams.id;
        vm.nothingChange = false;

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


        vm.gohistory = function (user) {
            $location.path(`admin/user/${user.id}/history`);
        };

        vm.updateUser = function () {
            vm.nothingChange = false;
            vm.loadingClass = "is-loading";

            var valuesToUpdate = {};
            if (vm.email !== vm.user.email) {
                valuesToUpdate.email = vm.email;
            }
            if (vm.type.value !== vm.user.type) {
                valuesToUpdate.type = vm.type.value;
            }
            if (vm.state.value !== vm.user.state) {
                valuesToUpdate.state = vm.state.value;
            }
            console.log(valuesToUpdate)
            if(Object.keys(valuesToUpdate).length === 0){
                vm.nothingChange = true;
                vm.loadingClass = "";
            }

            if(!vm.nothingChange){
                AdminFactory.update(vm.id, valuesToUpdate)
                    .then(response => {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('User modify!')
                                .position('bottom right')
                                .hideDelay(3000)
                        );
                        console.log(response);
                        vm.user = response.user;
                        vm.type = vm.options.type.selected = {name: vm.user.type === 'USER' ? 'Utilisateur' : 'Administrateur', value: vm.user.type};
                        vm.state = vm.options.state.selected = {name: vm.user.state ? 'Actif' : 'Inactif', value: vm.user.state};

                        vm.email = vm.user.email;
                    })
                    .catch(error => {
                        vm.errorRegister = error;
                    })
                    .then(function () {
                        vm.loadingClass = "";
                        $scope.$apply();
                    });
            }
        };


        AdminFactory.get($routeParams.id)
            .then(response => {
                console.log(response);
                vm.user = response.user;

                vm.email = vm.user.email;
                vm.type = vm.options.type.selected = {name: vm.user.type === 'USER' ? 'Utilisateur' : 'Administrateur', value: vm.user.type};
                vm.state = vm.options.state.selected = {name: vm.user.state ? 'Actif' : 'Inactif', value: vm.user.state};

                console.log(vm.type);
                console.log(vm.state);
                console.log(vm.user);
            })
            .catch(error => {
                console.log(error);
                switch (error) {
                    case "USER_NOT_FOUND":
                        vm.errorUser = error;
                        break;
                    case "HISTORIQUE_NOT_FOUND":
                        vm.errorHistorique = error;
                        break;
                    default:
                        vm.error = error;
                }
            })
            .then(function () {
                $scope.$apply();
            });

        const arraysEqual = function (a, b) {
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length != b.length) return false;

            // If you don't care about the order of the elements inside
            // the array, you should sort both arrays here.
            // Please note that calling sort on an array will modify that array.
            // you might want to clone your array first.

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
    }
})();

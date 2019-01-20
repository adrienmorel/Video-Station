(function () {
    "use strict";

    videoStation.controller("userController", userController);

    userController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory", "$mdToast", "blockUI", "$mdDialog"];

    function userController($scope, $location, $routeParams, AdminFactory, $mdToast, blockUI, $mdDialog) {
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

        vm.changePassword = function (user){
            $mdDialog.show({
                controller: vm.popupPlaylistController,
                templateUrl: '../template/admin/popup/changepassword.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
            }, function() {
            });

        };

        vm.popupPlaylistController = function DialogController($scope, $location, $routeParams, AdminFactory, $mdToast, blockUI, $mdDialog) {
            $scope.updateUserPassWord = function(){
                blockUI.start();
                var valuesToUpdate = {};
                valuesToUpdate.password = $scope.password;
                AdminFactory.update(vm.id, valuesToUpdate)
                    .then(response => {
                        $mdDialog.cancel();
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('User password modify!')
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
                        $scope.$apply(function () {
                            blockUI.stop();
                        });
                    });
            };
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
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

    }
})();

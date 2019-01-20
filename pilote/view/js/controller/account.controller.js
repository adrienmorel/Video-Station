(function () {
    "use strict";

    videoStation.controller("accountController", accountController);

    accountController.$inject = ["$scope", "$location", "$routeParams", "UserFactory", "$mdDialog", "blockUI"];

    function accountController($scope, $location, $routeParams, UserFactory, $mdDialog, blockUI) {
        const vm = this;
        vm.id = $routeParams.id;

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


        vm.gohistory = function () {
            $location.path(`account/historique`);
        };


        vm.changePassword = function() {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Would you like to change your password ?')
                .textContent('An email will be sent to ' + vm.email)
                .ariaLabel('Lucky day')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                blockUI.start();
                UserFactory.changePassword(vm.email)
                    .then(response => {
                        blockUI.stop();
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Mail send')
                                .textContent('The email have been send')
                                .ariaLabel('Alert Dialog Demo')
                                .ok('Ok')
                        );
                    })
                    .catch(error => {
                        blockUI.stop();
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Error : mail not send')
                                .textContent('We cant send a email')
                                .ariaLabel('Alert Dialog Demo')
                                .ok('Ok!')

                        );
                    });
            }, function() {
            });
        };


        UserFactory.get()
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

    }
})();

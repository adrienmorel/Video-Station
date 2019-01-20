(function () {
    "use strict";

    videoStation.controller("changepasswordController", changepasswordController);

    changepasswordController.$inject = ["$scope", "$location", "$routeParams", "UserFactory", "$mdDialog", "blockUI", "appAPI"];

    function changepasswordController($scope, $location, $routeParams, UserFactory, $mdDialog, blockUI, appAPI) {
        const vm = this;
        var token = $routeParams.token;

        var init = function () {
            blockUI.start();
            UserFactory.verifyTokenChangePassword(token)
                .then(response => {
                    vm.tokenValidate = true;
                    appAPI.setToken(token);
                    $scope.$apply(function () {
                        blockUI.stop();
                    });
                    console.log(response)
                })
                .catch(error => {
                    vm.tokenValidate = false;
                    $scope.$apply(function () {
                        blockUI.stop();
                    });
                    console.log(error);
                })

        };

        vm.updatePassword = function() {
            blockUI.stop();

            vm.loadingClass = "is-loading";


            var values = {
                password : vm.password
            };

            UserFactory.update(values)
                .then(response => {
                    $location.path("/login");
                })
                .catch(error => {
                    vm.errorRegister = error;
                })
                .then(function() {
                    vm.loadingClass = "";
                    $scope.$apply(function () {
                        blockUI.stop();
                    });
                });
        };

        init();

    }
})();

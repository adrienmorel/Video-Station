(function() {
    "use strict";

    videoStation.controller("historyOfUserController", historyOfUserController);

    historyOfUserController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory", "HistoriqueFactory"];

    function historyOfUserController($scope, $location, $routeParams, AdminFactory, HistoriqueFactory) {
        const vm = this;

        vm.historiques = {};

        AdminFactory.get($routeParams.id)
            .then(response => {
                console.log(response);
                vm.user = response.user;
                console.log(vm.user);
                return HistoriqueFactory.allOfUser($routeParams.id);
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
            .then(function(response) {

                console.log(response);

                vm.historiques.all = response.historiques[0];
                vm.historiques.month = response.historiques[1];
                vm.historiques.week = response.historiques[2];

                $scope.$apply();
            });
    }
})();

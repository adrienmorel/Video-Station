(function() {
    "use strict";

    videoStation.controller("accountController", accountController);

    accountController.$inject = ["$scope", "$location", "$routeParams", "HistoriqueFactory"];

    function accountController($scope, $location, $routeParams, HistoriqueFactory) {
        const vm = this;
        vm.test = 3;

        vm.historiques = {};
        vm.errorHistoriques = {};

        HistoriqueFactory.all()
            .then(response => {
                vm.historiques.all = response.historiques;
            })
            .catch(error => {
                vm.errorHistoriques.all = error;
            })
            .then(function() {
                $scope.$apply();
            });

        HistoriqueFactory.allThisWeek()
            .then(response => {
                vm.historiques.week = response.historiques;
            })
            .catch(error => {
                vm.errorHistoriques.week = error;
            })
            .then(function() {
                $scope.$apply();
            });

        HistoriqueFactory.allThisMonth()
            .then(response => {
                vm.historiques.month = response.historiques;
            })
            .catch(error => {
                vm.errorHistoriques.month = error;
            })
            .then(function() {
                $scope.$apply();
            });

    }
})();

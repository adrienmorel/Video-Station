(function() {
    "use strict";

    videoStation.controller("playlistController", playlistController);

    playlistController.$inject = ["$scope", "$location", "$routeParams", "PlaylistFactory"];

    function playlistController($scope, $location, $routeParams, PlaylistFactory) {
        const vm = this;

        vm.watch = function(id, brand){
            if(brand == 'Youtube'){
                $location.path(`/watch/${brand}/${id}`);
            }else{
                id = id.replace("/videos/", "");
                $location.path(`/watch/${brand}/${id}`);
            }
        };

        PlaylistFactory.get($routeParams.id)
            .then(response => {
                vm.playlist = response.playlist;
                console.log(vm.playlist);
            })
            .catch(error => {
                vm.errorList = error;
            })
            .then(function() {
                $scope.$apply();
            });
    }
})();

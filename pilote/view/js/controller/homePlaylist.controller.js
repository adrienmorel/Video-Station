(function() {
    "use strict";

    videoStation.controller("homePlaylistController", homePlaylistController);

    homePlaylistController.$inject = ["$scope", "$location", "$routeParams", "PlaylistFactory", "$mdToast"];

    function homePlaylistController($scope, $location, $routeParams, PlaylistFactory, $mdToast) {
        const vm = this;
        vm.goPlaylist = function(id){
            $location.path(`/playlist/${id}`);
        };

        vm.addPlaylist =function(){
                PlaylistFactory.add(vm.newPlaylist).then(function (response) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Playlist add!')
                            .position('bottom right')
                            .hideDelay(3000)
                    );
                    vm.playlists.push(response.playlist);
                    vm.newPlaylist = null;
                    $scope.$apply();
                }).catch(error => {
                    console.log("error", error);
                    vm.error = error;
                })
        };

        vm.removePlaylist = function(playlist){
            PlaylistFactory.remove(playlist)
                .then(response => {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Playlist remove!')
                            .position('bottom right')
                            .hideDelay(3000)
                    );
                    // remove the new list created to the arrays of list
                    vm.playlists = vm.playlists.filter(function(p) {
                        return p._id !== playlist._id;
                    });
                })
                .catch(error => {
                    console.log("error", error);
                    vm.error = error;
                })
                .then(function() {
                    $scope.$apply();
                });
        };

        PlaylistFactory.all()
            .then(response => {
                vm.playlists = response.playlists;
                console.log(vm.playlists);
            })
            .catch(error => {
                vm.errorPlaylist = error;
            })
            .then(function() {
                $scope.$apply();
            });
    }
})();

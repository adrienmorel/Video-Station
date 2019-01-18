(function() {
    "use strict";

    videoStation.controller("videoController", videoController);

    videoStation.filter('trustAsResourceUrl', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsResourceUrl(val);
        };
    }]);

    videoController.$inject = ["$scope", "$location", "$routeParams", "VideoFactory", "$mdDialog", "PlaylistFactory", "$mdToast"];

    function videoController($scope, $location, $routeParams, VideoFactory, $mdDialog, PlaylistFactory, $mdToast) {
        const vm = this;
        vm.customFullscreen = false;

        vm.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: vm.popupPlaylistController,
                templateUrl: '../template/popup/playlist.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: vm.customFullscreen // Only for -xs, -sm breakpoints.
            })
                .then(function(answer) {
                    console.log(answer);
                    vm.status = 'You said the information was "' + answer + '".';
                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });
        };

        vm.popupPlaylistController = function DialogController($scope, $mdDialog, PlaylistFactory, VideoFactory) {

            $scope.playlists = null;
            $scope.loadingClass = [];

            $scope.video = vm.video;

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };

            $scope.add = function(idPlaylist, video, index){
                $scope.loadingClass[index] = "is-loading";
                VideoFactory.add(idPlaylist, video).then(response => {
                    $mdDialog.cancel();
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Video add!')
                            .position('bottom right')
                            .hideDelay(3000)
                    );
                    $scope.loadingClass[index] = "";
                }).catch(error => {
                    $scope.errorAddVideo = error;
                })
            };

            PlaylistFactory.all()
                .then(response => {
                    $scope.playlists = response.playlists;
                    $scope.classNbPlaylist = "md-" + $scope.playlists.length + "-line";
                    console.log(vm.playlists);
                })
                .catch(error => {
                    $scope.errorPlaylist = error;
                })
                .then(function() {
                    console.log($scope.video);
                    console.log($scope.playlists);
                    $scope.$apply();
                });
        };

        VideoFactory.get($routeParams.id, $routeParams.brand)
            .then(response => {
                vm.video = response.videos;
                console.log(vm.video);
            })
            .catch(error => {
                vm.errorVideo = error;
            })
            .then(function() {
                $scope.$apply();
            });
    }
})();

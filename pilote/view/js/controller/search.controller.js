(function () {
    "use strict";

    videoStation.controller("searchController", searchController);

    searchController.$inject = ["$scope", "$location", "$routeParams", "VideoFactory", "HistoriqueFactory", "blockUI"];

    function searchController($scope, $location, $routeParams, VideoFactory, HistoriqueFactory, blockUI) {
        const vm = this;
        vm.videos = {};
        vm.results = [];

        vm.onLoad = false;

        vm.watch = function (id, brand) {
            if (brand == 'Youtube') {
                $location.path(`/watch/${brand}/${id}`);
            } else {
                id = id.replace("/videos/", "");
                $location.path(`/watch/${brand}/${id}`);
            }

        };

        var init = function () {
            blockUI.start();
            vm.onLoad = true;
            VideoFactory.search($routeParams.slug)
                .then(response => {
                    vm.videos.vimeo = response.videos[0];
                    vm.videos.youtube = response.videos[1];

                    var i = 0;
                    var j = 0;

                    vm.nbVideos = vm.videos.vimeo.length + vm.videos.youtube.length;

                    vm.classNbVideo = "md-" + vm.nbVideos + "-line";

                    while (i < vm.videos.vimeo.data.length || i < vm.videos.youtube.results.length) {
                        if (typeof vm.videos.youtube.results[i] !== 'undefined') {
                            vm.results[j] = vm.videos.youtube.results[i];
                            j++;
                        }

                        if (typeof vm.videos.vimeo.data[i] !== 'undefined') {
                            vm.results[j] = vm.videos.vimeo.data[i];
                            j++;
                        }
                        i++;
                    }

                    HistoriqueFactory.add($routeParams.slug).then(historique => {
                        console.log("Historique ajouter");
                    }).catch(error => {
                        console.log(error);
                    });
                })
                .catch(error => {
                    console.log(error);
                    vm.errorList = error;
                })
                .then(function () {
                    vm.onLoad = false;
                    $scope.$apply(function () {
                        blockUI.stop();
                    });
                });
        };

        init();


    }
})();

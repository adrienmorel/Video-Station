(function () {
    "use strict";

    videoStation.factory("VideoFactory", videoFactory);

    videoFactory.$inject = ["appAPI"];

    function videoFactory(appAPI) {
        const apiEndpoint = "video/";

        function makeEndpoint(method) {
            return `${apiEndpoint}${method}`;
        }

        const services = {search, remove, add, update, get};

        return services;

        function get(id, brand) {
            console.log(id);
            console.log(brand);
            return appAPI.get(makeEndpoint("get"), {id: id, brand: brand})
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`video eror: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }


        function search(slug) {
            return appAPI
                .get(makeEndpoint("search"), {slug: slug})
                .catch(error => {
                    console.log(`register error: ${error}`);
                    return Promise.reject("An unknow error occured.");

                });
        }

        function remove(id) {
            return appAPI
                .remove(makeEndpoint("delete"), {video: {id: id}})
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`delete list error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });

        }

        function add(idPlaylist, video) {
            return appAPI
                .post(makeEndpoint("add"), {
                    video: video, idPlaylist: idPlaylist
                })
                .catch(error => {
                    switch (error) {
                        case 'PLAYLIST_NOT_EXIST':
                            return Promise.reject("The playlist does not exist.");
                        // todo handle error
                        default:
                            console.log(`add list error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }

        function update(idVideo, name = undefined, isDone = undefined, idPlaylist = undefined) {
            var video = {};
            video.id = idVideo;

            if (typeof (name) !== "undefined") {
                video.name = name;
            }
            if (typeof (isDone) !== "undefined") {
                video.isDone = isDone;
            }
            if (typeof (idPlaylist) !== "undefined") {
                video.idPlaylist = idPlaylist;
            }
            return appAPI
                .put(makeEndpoint("update"), {video: video})
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`update list error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }
    }
})();

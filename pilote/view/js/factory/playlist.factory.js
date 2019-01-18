(function () {
    "use strict";

    videoStation.factory("PlaylistFactory", PlaylistFactory);

    PlaylistFactory.$inject = ["appAPI"];

    function PlaylistFactory(appAPI) {
        const apiEndpoint = "playlist/";

        function makeEndpoint(method) {
            return `${apiEndpoint}${method}`;
        }

        const services = {all, remove, add, get};

        return services;


        function all() {
            return appAPI.get(makeEndpoint("all"), {});
        }

        function get(id) {
            return appAPI
                .get(makeEndpoint("get"), { idPlaylist: id })
                .catch(error => {
                    switch (error) {
                        case "INVALID_PLAYLIST_ID_FORMAT":
                            return Promise.reject("Invalid format of the list.");
                        case "PLAYLIST_NOT_EXIST":
                            return Promise.reject("This list does not exist.");
                        default:
                            console.log(`get playlist error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }

        function add(name) {
            return appAPI
                .post(
                    makeEndpoint("add"),
                    {
                        playlist : {
                            name : name
                        }
                    }
                )
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`add list error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }

        function remove(playlist) {
            return appAPI
                .remove(makeEndpoint("delete"), { playlist: playlist })
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`delete list error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }


    }
})();

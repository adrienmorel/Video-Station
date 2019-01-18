(function () {
    "use strict";

    videoStation.factory("HistoriqueFactory", HistoriqueFactory);

    HistoriqueFactory.$inject = ["appAPI"];

    function HistoriqueFactory(appAPI) {
        const apiEndpoint = "historique/";

        function makeEndpoint(method) {
            return `${apiEndpoint}${method}`;
        }

        const services = {all, allThisMonth, allThisWeek, remove, add, get, allOfUser};

        return services;


        function all() {
            return appAPI.get(makeEndpoint("all"), {});
        }

        function allOfUser(id) {
            return appAPI.get(makeEndpoint("allOfUser"), {id : id, during : 'all'});
        }


        function allThisMonth() {
            return appAPI.get(makeEndpoint("all"), {during : 'month'});
        }

        function allThisWeek() {
            return appAPI.get(makeEndpoint("all"), {during: 'week'});
        }

        function get(id) {
            return appAPI
                .get(makeEndpoint("get"), { idHistorique: id })
                .catch(error => {
                    switch (error) {
                        case "INVALID_HISTORIQUE_ID_FORMAT":
                            return Promise.reject("Invalid format of the historique.");
                        case "HISTORIQUE_NOT_EXIST":
                            return Promise.reject("This historique does not exist.");
                        default:
                            console.log(`get historique error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }

        function add(research) {
            return appAPI
                .post(
                    makeEndpoint("add"),
                    {
                        historique : {
                            research : research
                        }
                    }
                )
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`add historique error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }

        function remove(historique) {
            return appAPI
                .remove(makeEndpoint("delete"), { historique: historique })
                .catch(error => {
                    switch (error) {
                        // todo handle error
                        default:
                            console.log(`delete historique error: ${error}`);
                            return Promise.reject("An unknow error occured.");
                    }
                });
        }


    }
})();

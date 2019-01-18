(function () {
    "use strict";

    videoStation.factory("AdminFactory", adminFactory);

    adminFactory.$inject = ["appAPI"];

    function adminFactory(appAPI) {

        const apiEndpoint = "admin/";

        function makeEndpoint(method) {
            return `${apiEndpoint}${method}`;
        }

        const services = {
            all,
            get,
            update,
            register
        };

        return services;

        function all() {
            return appAPI.get(makeEndpoint("all"), {});
        }

        function get(id) {
            return appAPI.get(makeEndpoint("get"), {id: id});
        }

        function update(id, valuesToUpdate) {
            return appAPI.post(makeEndpoint("update"), {id: id, valuesToUpdate: valuesToUpdate});
        }

        function register(email, password, type, state) {
            return appAPI.post(makeEndpoint("register"), {
                email: email,
                password: password,
                type: type,
                state: state
            })
            .then(response => {
                return Promise.resolve("Success!");
            })
            .catch(error => {
                switch (error) {
                    case "USER_ALREADY_EXIST":
                        return Promise.reject("That email is already used.");
                    default:
                        console.log(`register error: ${error}`);
                        return Promise.reject("An unknow error occured.");
                }
            });
        }
    }
})();

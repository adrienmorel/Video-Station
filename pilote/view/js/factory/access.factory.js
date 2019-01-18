(function() {
	"use strict";
	videoStation.factory("Access", ["$q", "UserFactory", function($q, UserFactory) {

		var Access = { OK: 200, UNAUTHORIZED: 401, FORBIDDEN: 403,
			isAuthenticated: function() {
				if (UserFactory.isLogged) {
					return Access.OK;
				}
				else {
					/*
					UserFactory.verify().then(res =>{
						if(res == 'BAD_TOKEN'){
							console.log("BAD");
                            return Promise.reject(Access.UNAUTHORIZED);
						}else{
                            return Access.OK;
						}

					}).catch(err => {
                        return Promise.reject(Access.UNAUTHORIZED);
					})
					*/

                    return Promise.reject(Access.UNAUTHORIZED);

				}
			},
			isAnonymous: function() {
				if (UserFactory.isLogged) {
					return Promise.reject(Access.FORBIDDEN);
				} else {
					return Access.OK;
				}
			}
		};

		return Access;

	}]);
})();
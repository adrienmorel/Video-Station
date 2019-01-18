const videoStation = angular.module("videoStation", ["ngRoute", "ngSanitize", "ngAnimate", "ngMaterial", "ngMessages", "ngCookies", "blockUI"]);(function() {
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
})();(function() {
	"use strict";

	videoStation.factory("appAPI", appAPI);

	function appAPI() {
		const apiURL = "/api/";

		function getToken() {
			return localStorage.getItem("token");
		}

		function setToken(newValue) {
			return localStorage.setItem("token", newValue);
		}
		function send(path, params = {}, type = "POST") {

			let url = `${apiURL}${path}`;

			console.log(url);

			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();

				xhr.open(type, url, true);
				xhr.responseType = "json";

				xhr.setRequestHeader("Content-type", "application/json");
				xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
				// todo: improve by using only one method get and set (user ?)
				xhr.setRequestHeader("x-access-token", getToken());

				xhr.onload = () => {
					try {
						// try to see if success
						if (xhr.response.success) {
							resolve(xhr.response.data);
							// it's an error
						} else {
							// todo:
							// check if error is related to token
							// BAD_TOKEN or TOKEN_NEEDED
							reject(xhr.response.error);
						}
					} catch (e) {
						// no proper format, don't know if success or error
						// so we reject
						reject(xhr.response);
					}
				};

				xhr.onerror = () => {
					// todo error
					console.log(xhr.error);
					reject();
					// if BAD_TOKEN or TOKEN_NEEDED
					// logout and login
				};

				xhr.send(JSON.stringify(params));
			});
		}

		function get(path, params = {}) {

			function formatParams(params) {
				return "?" + Object.keys(params)
				.map(function(key) {
					return key + "=" + encodeURIComponent(params[key]);
				})
				.join("&");
			}

			return send(path + formatParams(params), null, "GET")
		}

		function post(path, params = {}) {
			return send(path, params, "POST")
		}

		function remove(path, params = {}) {
			return send(path, params, "DELETE")
		}

		function put(path, params = {}) {
			return send(path, params, "PUT");
		}

		const services = { post, remove, put, get, getToken, setToken };

		return services;

	}
})();
(function() {
	"use strict";
	
	videoStation.factory("UserFactory", userFactory);
	
	userFactory.$inject = ["appAPI"];
	
	function userFactory(appAPI) {
		
		const apiEndpoint = "user/";
		//var loggedStorage = localStorage.getItem("logged");
        //var loggedState = loggedStorage !== ('undefined') ? loggedStorage === 'TRUE' : false;
		var loggedState = false;
        var adminState = false;
        var actif = true;
		
		function makeEndpoint(method) {
			return `${apiEndpoint}${method}`;
		}
		
		const services = { 
			login,
			logout,
			register,
			get isLogged() {
				return loggedState;
			},
			get isAdmin(){
				return adminState;
			},
			get isActif(){
				return actif;
			},
			verify
		};
		
		return services;

		function login(email, password) {
            adminState = false;
			return appAPI.post(makeEndpoint('login'), {
				email: email,
				password: password
			})
			.then(response => {
				if(response.type === 'ADMIN') adminState = true;
				logged(response.token);
				return Promise.resolve("Success!");
			})
			.catch(error => {
				switch (error) {
					case "USER_NOT_EXIST":
					return Promise.reject("The user does not exist.");
					case "WRONG_PASSWORD":
					return Promise.reject("The password is not valid.");
                    case "INACTIVE_STATE":
                    return Promise.reject("You are inactive.");
					default:
					console.log(`login error: ${error}`);
					return Promise.reject("An unknow error occured.");
				}
			});
		}

        function logged(token) {
			appAPI.setToken(token);
            //localStorage.setItem("logged", "TRUE");
			loggedState = true;
		}
		
		function logout() {
			appAPI.setToken(null);
            //localStorage.setItem("logged", "FALSE");
			loggedState = false;
		}
		
		function verify() {
			return appAPI
			.post(makeEndpoint("verify"), {})
			.then(response => {
				return Promise.resolve(true);
			})
			.catch(error => {
				return Promise.resolve(error);
			});
		}
		
		function register(email, password) {
			return appAPI
			.post(makeEndpoint("register"), {
				email: email,
				password: password
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
(function() {
	"use strict";
	
	videoStation.factory("ListFactory", listFactory);
	
	listFactory.$inject = ["appAPI"];
	
	function listFactory(appAPI) {
		const apiEndpoint = "list/";
		
		function makeEndpoint(method) {
			return `${apiEndpoint}${method}`;
		}
		
		const services = { all, get, add, remove };
		
		return services;
		function all() {
			return appAPI.get(makeEndpoint("all"), {});
		}
		
		function get(id) {
			return appAPI
			.get(makeEndpoint("get"), { idList: id })
			.catch(error => {
				switch (error) {
					case "INVALID_LIST_ID_FORMAT":
						return Promise.reject("Invalid format of the list.");
					case "LIST_NOT_EXIST":
						return Promise.reject("This list does not exist.");
					default:
						console.log(`get list error: ${error}`);
						return Promise.reject("An unknow error occured.");
				}
			});
		}
		
		function add(name) {
			return appAPI
			.post(
				makeEndpoint("add"), 
				{ 
					list: {
						name: name 
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
		
		function remove(id) {
			return appAPI
			.remove(makeEndpoint("delete"), { list: { id: id } })
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
(function() {
	"use strict";
	
	videoStation.factory("TaskFactory", taskFactory);
	
	taskFactory.$inject = ["appAPI"];
	
	function taskFactory(appAPI) {
		const apiEndpoint = "task/";
		
		function makeEndpoint(method) {
			return `${apiEndpoint}${method}`;
		}
		
		const services = { all, remove, add, update };
		
		return services;
		function all(id) {
			return appAPI
			.get(makeEndpoint("all"), { task: { idList: id } })
			.catch(error => {
				switch (error) {
					case "INVALID_LIST_ID_FORMAT":
					return Promise.reject("Invalid format of the list.");
					case "LIST_NOT_EXIST":
					return Promise.reject("This list does not exist.");
					default:
					console.log(`register error: ${error}`);
					return Promise.reject("An unknow error occured.");
				}
			});
		}
		
		function remove(id) {
			return appAPI
			.remove(makeEndpoint("delete"), { task: { id: id } })
			.catch(error => {
				switch (error) {
					// todo handle error
					default:
					console.log(`delete list error: ${error}`);
					return Promise.reject("An unknow error occured.");
				}
			});
			
		}
		
		function add(idList, name) {
			return appAPI
			.post(makeEndpoint("add"), {
				task: { idList: idList, name: name }
			})
			.catch(error => {
				switch (error) {
					case 'LIST_NOT_EXIST':
					return Promise.reject("The list does not exist.");
					// todo handle error
					default:
					console.log(`add list error: ${error}`);
					return Promise.reject("An unknow error occured.");
				}
			});
		}
		
		function update(idTask, name = undefined, isDone = undefined, idList = undefined) {
			var task = {};
			task.id = idTask;
			
			if (typeof(name) !== "undefined") {
				task.name = name;
			}
			if (typeof(isDone) !== "undefined") {
				task.isDone = isDone;
			}
			if (typeof(idList) !== "undefined") {
				task.idList = idList;
			}
			return appAPI
			.put(makeEndpoint("update"), { task: task })
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
(function() {
	"use strict";
	
	videoStation.controller("menuController", menuController);
	
	menuController.$inject = ["$scope", "$rootScope", "$location", "UserFactory"];
	function menuController($scope, $rootScope, $location, UserFactory) {
		const vm = this;

        vm.searchText = "";

		$scope.$watch(
			function() {
				return UserFactory.isLogged;
			},
			function(newVal, oldVal) {
				$scope.isLogged = newVal;
			}
		);

        $scope.$watch(
            function() {
                return UserFactory.isAdmin;
            },
            function(newVal, oldVal) {
                $scope.isAdmin = newVal;
            }
        );

		vm.search = function(){
            $location.path(`/search/${vm.searchText}`);
		};

		vm.goManageApplication = function(){
            $location.path("admin/application");
		};

		vm.goHome = function() {
      		$location.path("/");
    	};

        vm.goAccount = function() {
            $location.path("/account");
        };

		vm.goPlaylist = function (){
            $location.path("/playlists");
		};

		vm.goLogin = function() {
			$location.path("/login");
		};

		vm.goRegister = function() {
			$location.path("/register");
		};

		vm.logoutUser = function() {
			UserFactory.logout();
			vm.goLogin();
		};
		
	}
})();
(function() {
	"use strict";
	
	videoStation.controller("loginController", loginController);
	
	loginController.$inject = ["$scope", "UserFactory", "$location"];
	
	function loginController($scope, UserFactory, $location) {
		const vm = this;
		
		vm.loginUser = function() {
			
			vm.loadingClass = "is-loading";
			
			UserFactory.login(vm.email, vm.password)
			.then(response => {
				$location.path("/home");
			})
			.catch(error => {
				vm.errorLogin = error;
			})
			.then(function() {
				vm.loadingClass = "";
				$scope.$apply();
			});
		};
		
		vm.goRegister = function() {
			$location.path("/register");
		};
	}
	
})();(function() {
	"use strict";
	
	videoStation.controller("homeController", homeController);
	
	homeController.$inject = ["$scope", "$location", "UserFactory", "ListFactory"];
	
	function homeController($scope, $location, UserFactory, ListFactory) {
		const vm = this;
		
		vm.addList = function() {
			
			vm.loadingClass = "is-loading";
			
			ListFactory.add(vm.listName)
			.then(response => {
				// add the new list created to the arrays of list
				vm.lists.push(response.list);
				// reset input
				vm.listName = null;
			})
			.catch(error => {
				// todo handle error
				console.log("error", error);
			})
			.then(function() {
				vm.loadingClass = "";
				$scope.$apply();
			});
		};
		
		vm.removeList = function(listID) {
			
			ListFactory.remove(listID)
			.then(response => {
				// remove the new list created to the arrays of list
				vm.lists = vm.lists.filter(function(list) {
					return list._id !== listID;
				});
			})
			.catch(error => {
				// todo handle error
				console.log("error", error);
			})
			.then(function() {
				$scope.$apply();
			});
		};
		
		vm.seeList = function(listID) {
			$location.path(`/list/${listID}`);
		};
		
		ListFactory.all()
		.then(response => {
			vm.lists = response.lists;
		})
		.catch(error => {
			// todo handle error
			console.log("error : " + error);
		})
		.then(function() {
			$scope.$apply();
		});
		
	}
	
})();(function() {
	"use strict";
	
	videoStation.controller("registerController", registerController);
	
	registerController.$inject = ["$scope", "$location", "UserFactory"];
	
	function registerController($scope, $location, UserFactory) {
		const vm = this;
		
		vm.registerUser = function() {

			vm.loadingClass = "is-loading";
			
			UserFactory.register(vm.email, vm.password)
			.then(response => {
				$location.path("/login");
			})
			.catch(error => {
				vm.errorRegister = error;
			})
			.then(function() {
				vm.loadingClass = "";
				$scope.$apply();
			});
		};
		
		vm.goLogin = function() {
			$location.path("/login");
		};
		
	}
})();
(function() {
	"use strict";
	
	videoStation.controller("listController", listController);
	
	listController.$inject = ["$scope", "$location", "$routeParams", "TaskFactory", "ListFactory"];
	
	function listController($scope, $location, $routeParams, TaskFactory, ListFactory) {
		const vm = this;
		vm.taskToAdd = {};
		vm.list = {};
		
		vm.removeTask = function(taskID) {
			TaskFactory.remove(taskID)
			.then(response => {
				// remove the new list created to the arrays of list
				vm.list.tasks = vm.list.tasks.filter(function(task) {
					return task._id !== taskID;
				});
			})
			.catch(error => {
				// todo handle error
				console.log("error", error);
			})
			.then(function() {
				$scope.$apply();
			});
		};
		
		vm.addTask = function() {
			$scope.addLoadingClass = "is-loading";
			
			TaskFactory.add($routeParams.id, vm.taskToAdd.name)
			.then(response => {
				// add the new task created to the arrays of tasks
				vm.list.tasks.push(response.task);
				// reset input
				vm.taskToAdd.name = null;
			})
			.catch(error => {
				vm.errorList = error;
			})
			.then(function() {
				vm.addLoadingClass = "";
				$scope.$apply();
			});
		};
		
		vm.updateStatus = function(idTask, isDone) {
			TaskFactory.update(idTask, undefined, isDone, undefined)
			.then(response => {
				// update the task
				var index = vm.list.tasks.findIndex(task => task._id == idTask);
				vm.list.tasks[index].isDone = isDone;
			})
			.catch(error => {
				vm.errorList = error;
			})
			.then(function() {
				$scope.$apply();
			});
		};
		
		ListFactory.get($routeParams.id)
		.then(response => {
			vm.list.name = response.list.name;
			vm.list.tasks = response.list.tasks;
		})
		.catch(error => {
			vm.errorList = error;
		})
		.then(function() {
			$scope.$apply();
		});
	}
})();
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
(function() {
    "use strict";

    videoStation.controller("applicationController", applicationController);

    applicationController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory"];

    function applicationController($scope, $location, $routeParams, AdminFactory) {
        const vm = this;

        vm.goUser = function(user){
            $location.path(`admin/user/${user.id}`);
        };

        vm.goRegister = function(){
            $location.path("admin/register");
        };

        AdminFactory.all()
            .then(response => {
                console.log(response)
                vm.accounts = response.users;
            })
            .catch(error => {
                vm.errorAccounts = error;
            })
            .then(function() {
                $scope.$apply();
            });
    }
})();
(function() {
    "use strict";

    videoStation.controller("historyOfUserController", historyOfUserController);

    historyOfUserController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory", "HistoriqueFactory"];

    function historyOfUserController($scope, $location, $routeParams, AdminFactory, HistoriqueFactory) {
        const vm = this;

        vm.historiques = {};

        AdminFactory.get($routeParams.id)
            .then(response => {
                console.log(response);
                vm.user = response.user;
                console.log(vm.user);
                return HistoriqueFactory.allOfUser($routeParams.id);
            })
            .catch(error => {
                console.log(error);
                switch (error) {
                    case "USER_NOT_FOUND":
                        vm.errorUser = error;
                        break;
                    case "HISTORIQUE_NOT_FOUND":
                        vm.errorHistorique = error;
                        break;
                    default:
                        vm.error = error;
                }
            })
            .then(function(response) {

                console.log(response);

                vm.historiques.all = response.historiques[0];
                vm.historiques.month = response.historiques[1];
                vm.historiques.week = response.historiques[2];

                $scope.$apply();
            });
    }
})();
(function () {
    "use strict";

    videoStation.controller("userController", userController);

    userController.$inject = ["$scope", "$location", "$routeParams", "AdminFactory", "$mdToast"];

    function userController($scope, $location, $routeParams, AdminFactory, $mdToast) {
        const vm = this;
        vm.id = $routeParams.id;
        vm.nothingChange = false;

        vm.options = {};
        vm.form = {};
        vm.options.type = {
            available: [
                {name: 'Administrateur', value: 'ADMIN'},
                {name: 'Utilisateur', value: 'USER'}
            ]
        };
        vm.options.state = {
            available: [
                {name: 'Actif', value: true},
                {name: 'Inactif', value: false}
            ]
        };


        vm.gohistory = function (user) {
            $location.path(`admin/user/${user.id}/history`);
        };

        vm.updateUser = function () {
            vm.nothingChange = false;
            vm.loadingClass = "is-loading";

            var valuesToUpdate = {};
            if (vm.email !== vm.user.email) {
                valuesToUpdate.email = vm.email;
            }
            if (vm.type.value !== vm.user.type) {
                valuesToUpdate.type = vm.type.value;
            }
            if (vm.state.value !== vm.user.state) {
                valuesToUpdate.state = vm.state.value;
            }
            console.log(valuesToUpdate)
            if(Object.keys(valuesToUpdate).length === 0){
                vm.nothingChange = true;
                vm.loadingClass = "";
            }

            if(!vm.nothingChange){
                AdminFactory.update(vm.id, valuesToUpdate)
                    .then(response => {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('User modify!')
                                .position('bottom right')
                                .hideDelay(3000)
                        );
                        console.log(response);
                        vm.user = response.user;
                        vm.type = vm.options.type.selected = {name: vm.user.type === 'USER' ? 'Utilisateur' : 'Administrateur', value: vm.user.type};
                        vm.state = vm.options.state.selected = {name: vm.user.state ? 'Actif' : 'Inactif', value: vm.user.state};

                        vm.email = vm.user.email;
                    })
                    .catch(error => {
                        vm.errorRegister = error;
                    })
                    .then(function () {
                        vm.loadingClass = "";
                        $scope.$apply();
                    });
            }
        };


        AdminFactory.get($routeParams.id)
            .then(response => {
                console.log(response);
                vm.user = response.user;

                vm.email = vm.user.email;
                vm.type = vm.options.type.selected = {name: vm.user.type === 'USER' ? 'Utilisateur' : 'Administrateur', value: vm.user.type};
                vm.state = vm.options.state.selected = {name: vm.user.state ? 'Actif' : 'Inactif', value: vm.user.state};

                console.log(vm.type);
                console.log(vm.state);
                console.log(vm.user);
            })
            .catch(error => {
                console.log(error);
                switch (error) {
                    case "USER_NOT_FOUND":
                        vm.errorUser = error;
                        break;
                    case "HISTORIQUE_NOT_FOUND":
                        vm.errorHistorique = error;
                        break;
                    default:
                        vm.error = error;
                }
            })
            .then(function () {
                $scope.$apply();
            });

        const arraysEqual = function (a, b) {
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length != b.length) return false;

            // If you don't care about the order of the elements inside
            // the array, you should sort both arrays here.
            // Please note that calling sort on an array will modify that array.
            // you might want to clone your array first.

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
    }
})();
(function() {
    "use strict";

    videoStation.controller("registerAdminController", registerAdminController);

    registerAdminController.$inject = ["$scope", "$location", "AdminFactory", "$mdToast"];

    function registerAdminController($scope, $location, AdminFactory, $mdToast) {
        const vm = this;

        vm.options = {};
        vm.form = {};
        vm.options.type = {
            available: [
                {name: 'Administrateur', value: 'ADMIN'},
                {name: 'Utilisateur', value: 'USER'}
            ]
        };
        vm.options.state = {
            available: [
                {name: 'Actif', value: true},
                {name: 'Inactif', value: false}
            ]
        };

        vm.state = vm.options.state.available[0];
        vm.type = vm.options.type.available[1];

        vm.registerUser = function() {
            vm.loadingClass = "is-loading";

            AdminFactory.register(vm.email, vm.password, vm.type.value, vm.state.value)
                .then(response => {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('User add!')
                            .position('bottom right')
                            .hideDelay(3000)
                    );
                    $location.path("/admin/application");
                })
                .catch(error => {
                    vm.errorRegister = error;
                })
                .then(function() {
                    vm.loadingClass = "";
                    $scope.$apply();
                });
        };

        vm.goLogin = function() {
            $location.path("/login");
        };

    }
})();
(function () {
    "use strict";

    videoStation.config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/login", {
                title: 'Login',
                templateUrl: "template/login.html",
                controller: "loginController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAnonymous();
                    }],
                }
            })
            .when("/register", {
                title: 'Register',
                templateUrl: "template/register.html",
                controller: "registerController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAnonymous();
                    }],
                }
            })
            .when("/home", {
                title: 'My lists',
                templateUrl: "template/home.html",
                controller: "homeController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/list/:id", {
                title: 'List of task',
                templateUrl: "template/list.html",
                controller: "listController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/search/:slug", {
                title: 'Recherche',
                templateUrl: "template/search.html",
                controller: "searchController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/watch/:brand/:id", {
                title: 'watch',
                templateUrl: "template/video.html",
                controller: "videoController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/playlists", {
                title: 'List playlist',
                templateUrl: "template/homePlaylist.html",
                controller: "homePlaylistController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/playlist/:id", {
                title: 'Playlist',
                templateUrl: "template/playlist.html",
                controller: "playlistController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/account", {
                title: 'Compte',
                templateUrl: "template/account.html",
                controller: "accountController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/admin/application", {
                title: 'Application',
                templateUrl: "template/admin/application.html",
                controller: "applicationController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/admin/user/:id", {
                title: 'User',
                templateUrl: "template/admin/user.html",
                controller: "userController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/admin/user/:id/history", {
                title: 'History',
                templateUrl: "template/admin/historyOfUser.html",
                controller: "historyOfUserController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .when("/admin/register", {
                title: 'New user',
                templateUrl: "template/admin/register.html",
                controller: "registerAdminController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAuthenticated();
                    }],
                }
            })
            .otherwise({redirectTo: "/home"});
    }]);

})();
(function() {
	"use strict";
	
	videoStation.run([
		"$rootScope",
		"Access",
		"$location",
		"UserFactory",
		function($rootScope, Access, $location, UserFactory) {
			$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
				console.log("routeChangeError");
				switch (rejection) {
					case Access.UNAUTHORIZED:
					$location.path("/login");
					break;
					
					case Access.FORBIDDEN:
					$location.path("/home");
					break;
					
					default:
					console.log(`$stateChangeError event catched: ${rejection}`);
					console.log(`event: ${event}`);
					break;
				}
			});
			
			$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        		$rootScope.title = current.$$route.title;
    		});
		}
		
	]);
})();
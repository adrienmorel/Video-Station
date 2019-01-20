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
            .when("/changepassword/:token", {
                title: 'Change password',
                templateUrl: "template/changepassword.html",
                controller: "changepasswordController",
                controllerAs: "vm",
                resolve: {
                    access: ["Access", function (Access) {
                        return Access.isAnonymous();
                    }],
                }
            })
            .when("/account/historique", {
                title: 'Historique',
                templateUrl: "template/historique.html",
                controller: "historiqueController",
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

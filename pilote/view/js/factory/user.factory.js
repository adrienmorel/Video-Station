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

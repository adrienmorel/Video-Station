(function() {
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

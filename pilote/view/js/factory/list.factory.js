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

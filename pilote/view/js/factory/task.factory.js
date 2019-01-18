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

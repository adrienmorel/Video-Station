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

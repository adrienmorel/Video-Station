(function() {
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
	
})();
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
app.controller("DetailsCtrl", function($location, $rootScope, $scope, $http, $window){

	$scope.currentUserFavorites = [];
	$scope.usersWhoFavoritedCar = "";

	// if we are logged in, get the IDs of cars the user has favorited
	if ($rootScope.currentUser)
    {
        $http.get('/getUsersFavoritesIDs/' + $rootScope.currentUser.username)
        .success(function(response){
            console.log("setting current user favorites to " + response);
            $scope.currentUserFavorites = response;
        });
    }
   
    // retrieve car info from edmunds to display details
    $http.jsonp("https://api.edmunds.com/api/vehicle/v2/styles/" + $rootScope.currentDetailID + "?view=full&fmt=json&api_key=vwp9323cjna6pjxg5jqtc3qc&callback=JSON_CALLBACK")
        .success(function (response) {
            $scope.detailsVehicleInfo = response;
            console.log("current vehicle info is");
            console.log(response);
     });

        
    $http.get("/getCarFavorites/" + $rootScope.currentDetailID)
    	.success(function (response) {
    		$scope.usersWhoFavoritedCar = response;
   	});

   	// favorite the given car
    $scope.favoriteCar = function(username, vehicleID, vehicleName, vehicleYear)
    {
        console.log("favoriting car: username" + username + " " + "vehicleID " + vehicleID);
        $http.post('/favoriteCar/' + username + '/' + vehicleID + '/' + vehicleName + '/' + vehicleYear)
        .success(function(response){
            $scope.currentUserFavorites.push(vehicleID);
            $scope.usersWhoFavoritedCar.push($rootScope.currentUser);
        });
    }

    // unfavorite the given car from username's profile
    $scope.unFavoriteCar = function(username, vehicleID)
    {
        console.log("deleting car: username" + username + " " + "vehicleID " + vehicleID);
        $http.post('/deleteFavoriteCar/' + username + '/' + vehicleID)
        .success(function(response){
            var index = $scope.currentUserFavorites.indexOf(vehicleID);
            $scope.currentUserFavorites.splice(index, 1);

            // find index of current user and remove it from list
            for (i = 0; i < $scope.usersWhoFavoritedCar.length; i++)
            {
            	if ($scope.usersWhoFavoritedCar[i].username == username)
            	{
            		break;
            	}
            }
            $scope.usersWhoFavoritedCar.splice(i, 1);
        });
    }

    // return car objects that represent the users favorites
    $scope.getUsersFavorites = function(username)
    {
        $http.get('/getUsersFavorites/' + username)
        .success(function(response){
            //$scope.currentUserFavorites = response;
        });
    }

    // return a list of IDs that represent the users favorites
    $scope.getUsersFavoritesIDs = function(username)
    {
        $http.get('/getUsersFavoritesIDs/' + username)
        .sucess(function(response){
            $scope.currentUserFavorites = response;
        });
    }

    // we want to reuse the user profile page, so we will set a rootScope variable to maintain the user to show in this case
    $scope.routeToProfilePage = function(username)
    {
    	// spent an hour debugging a race condition because this was done in a callback and not set
    	// in time for changing the new view
    	$rootScope.publicUserUsername = username;

    	// go to profile page if logged in user is clicked on
    	if ($rootScope.currentUser && (username == $rootScope.currentUser.username)){
    		$location.url("/profile");
    	} else {
    		// otherwise, get the user info and set it to be the current public user
			$http.get('/getUser/' + username)
			.success(function(response){
				$rootScope.publicUser = response;
        	});

        	$location.url("/publicProfile");
    	}
    }

    // add a comment to the current vehicle
    $scope.submitVehicleComment = function(username, vehicleId, comment)
    {
    	$http.post("/submitVehicleComment/" + username + '/' + vehicleId + '/' + comment)
    	.success(function(response){
    		$scope.getVehicleComments($rootScope.currentDetailID);
    	});
    }

    // get comments on the current vehicle
    $scope.getVehicleComments = function(vehicleId)
    {
    	$http.get("/getVehicleComments/" + vehicleId)
    	.success(function(response){
    		$scope.vehicleComments = response;
    	});
    }

    $scope.getVehicleComments($rootScope.currentDetailID);
});

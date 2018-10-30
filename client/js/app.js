

(function () {  // anonymous wrapper pour que la varaible soit locale et non global
    'use strict';

    
    //TODO  mettre les services du module authentification dans Applicaiton Exemple
    angular.module('myApp', ['ngRoute','ui.bootstrap','nvd3']);

    angular.module('myApp')
    	   .config(['$routeProvider', function($routeProvider) {
            $routeProvider
                .when('/',{
                  templateUrl: 'accueil/accueil.html',
                  controller:"accueilControleur",
                    controllerAs:"ctrl"
                })
                .when('/programme',{
                  templateUrl: 'programme/programme.html',
                  controller:"programmeControleur",
                    controllerAs:"ctrl",
                    resolve : {auth:["$q", "authService", function($q, authService) {
                                var userInfo = authService.getUserInfo();

                                if (userInfo.accessToken) {
                                    return $q.when(userInfo);
                                } else {
                                    return $q.reject({ authenticated: false });
                                }
                            }]}
                })
                .otherwise({ redirectTo: '/' });
		}])
        .run(["$rootScope", "$location", function($rootScope, $location) {
            $rootScope.$on("$routeChangeSuccess", function(userInfo) {
                //console.log(userInfo);
            });
            $rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
                if (eventObj.authenticated === false) {
                    $location.path("/");
                }
            });
        }]);

/**
* Controleur principale
*/
    angular
    .module('myApp')
    .controller('appCtrl', appCtrl);

    appCtrl.$inject = ['$scope','$location',  '$timeout', 'authService','$window'];

    function appCtrl($scope,$location, $timeout, authService, $window) {
      var vm = this;
      vm.connected=false;
      vm.user = "";
      vm.password = "";
      vm.sigin = sigin;
      vm.sigout = sigout;
      
      //Constructor
      
      //methodes
       function sigin() {
            authService.sigin(vm.user, vm.password).then(function (result) {
                $location.path("/");
                vm.connected = true;
            }, function (error) {
                $window.alert("Invalid credentials");
                console.log(error);
                vm.connected = false;
            });
        }
        function sigout() {
            authService.sigout().then(function (result) {
                vm.connected = false;
                $location.path("/");
                
            }, function (error) {
                console.log(error);
                vm.connected = false;
                $location.path("/");
            });
        }
    }


})(); //fin  de l'anonymous wrapper

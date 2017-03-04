

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

//authService.js
(function () {
    angular
        .module('myApp')
        .service('authService', authService);

    authService.$inject = ['$http', '$location', '$q', '$window'];

    function authService($http, $location, $q, $window) {
        var userInfo;
        var service = {
            getUserInfo: getUserInfo,
            sigout: logout,
            sigin: sigin
        };


        function clear() {
            token = "";
        };

        function sigin(aUser, aPassword) {
            var deferred = $q.defer();
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/authenticate',
                    method: 'POST',
                    data: { name: aUser, password: aPassword },
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
                }
                )
                .then(function (value) {
                    if (!value.data.success) {
                        userInfo = null;
                        $window.sessionStorage["userInfo"] = null;
                        deferred.reject(value.data.message);    
                    }
                    userInfo = {
                        accessToken: value.data.token,
                        userName: value.data.user
                    };
                    $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                    deferred.resolve(userInfo);

                }, function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }

        function getUserInfo() {
            return userInfo;
        }
        function init() {
            if ($window.sessionStorage["userInfo"]) {
                userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            }
        }

        function logout() {
            var deferred = $q.defer();

            $http({
                method: "POST",
                url: "/api/logout",
                headers: {
                    "x-access-token": userInfo.accessToken
                }
            }).then(function (result) {
                userInfo = null;
                $window.sessionStorage["userInfo"] = null;
                deferred.resolve(result);
            }, function (error) {
                userInfo = null;
                $window.sessionStorage["userInfo"] = null;
                deferred.reject(error);
            });

            return deferred.promise;
        }

        init();
        return service;
    }
})();

//service.js
(function () {
    angular
        .module('myApp')
        .service('crudService', crudService);

    crudService.$inject = ['$http', '$location', '$q', '$window'];

    function crudService($http, $location, $q, $window) {

        var service = {
            get: get,
            put: put,
            delete: remove,
            post: post
        };





        function get(api, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/' + api,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        "x-access-token": userInfo.accessToken
                    }
                }
            )
                .then(function (response) {
                    callback(response.data);
                })
                .catch(function (err) {
                    console.log("XHR failed for readFile." + err.data);
                });
        };

        function put(object, api, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/' + api,
                    method: 'PUT',
                    data: object,
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        "x-access-token": userInfo.accessToken
                    }
                }
            )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl create error " + response.statusText);
                });
        };

        function remove(api, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/' + api,
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        "x-access-token": userInfo.accessToken
                    }
                }
            )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl update error " + response.statusText);
                });
        };

        function post(object, api, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/' + api,
                    method: 'POST',
                    data: object,
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        "x-access-token": userInfo.accessToken
                    }
                }
            )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl create error " + response.statusText);
                });
        };



        return service;
    }
})();

(function () {  // anonymous wrapper pour que la varaible soit locale et non global
    'use strict';

    angular
        .module('myApp')
        .controller('accueilControleur', accueilControleur);

    accueilControleur.$inject = ["$scope", "$timeout", "$http", "$location", '$routeParams', '$parse', '$document', 'crudService'];

    function accueilControleur($scope, $timeout, $http, $location, $routeParams, $parse, $document,  crudService) {

        var vm = this;
        vm.list = [];
        vm.item = {};


        //Constructor


        crudService.get("api/reunions", function (result) {
            vm.list = result;
        })

 
      
  

        //Methodes
        function getItem() {
            crudService.get(apiGet, function (result) {
                vm.item = result;
            })
        }
        function getList() {
            crudService.get(apiList, function (result) {
                vm.list = result;
            })
        }

    }
})(); //fin  de l'anonymous wrapper

(function () {  // anonymous wrapper pour que la varaible soit locale et non global
    'use strict';

    angular
        .module('myApp')
        .controller('programmeControleur', programmeControleur);

    programmeControleur.$inject = ["$scope", "$timeout", "$http", "$location", '$routeParams', '$parse', '$filter', '$document', 'crudService', 'programmeService', '$window'];

    function programmeControleur($scope, $timeout, $http, $location, $routeParams, $parse, $filter, $document, crudService, programmeService, $window) {

        var vm = this;
        vm.list = [];
        vm.item = {};
        vm.datejour = new Date();
        vm.status = {
            isFirstOpen: true
        }
        vm.getCote = getCote;
        vm.getResultat = getResultat;
        vm.openCalendar = openCalendar;
        vm.isCalendarOpen = false;
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            minDate: new Date(2017, 0, 18),
            maxDate: new Date(),
        };

        vm.bulletChartOptions = {
            chart: {
                type: 'bulletChart',
                transitionDuration: 500
            }
        };
        vm.bulletChartData = {
                "title": "Courses gagnées",
                "subtitle": "",
                "ranges": [0, 10, 20, 40],
                "measures": [0],
                "markers": [0]
            }




        //Constructor
        $scope.$watch(function () { return vm.datejour; }, function (newValue, oldValue, scope) {
            if ($window.sessionStorage["userInfo"]) {
                //crudService.get("api/programme/26012017", function (result) {
                crudService.get("api/programme/" + $filter("date")(vm.datejour, "ddMMyyyy"), function (result) {
                    vm.item = result;
                    setBulletChartData();
                });
            }
        });
        if ($window.sessionStorage["userInfo"]) {
            //crudService.get("api/programme/26012017", function (result) {
            crudService.get("api/programme/" + $filter("date")(vm.datejour, "ddMMyyyy"), function (result) {
                vm.item = result;
            });
        }

        $timeout(function() {
            setBulletChartData();
        },1000);



        //Methodes
        function getItem() {
            crudService.get(apiGet, function (result) {
                vm.item = result;
            })
        }
        function getList() {
            crudService.get(apiList, function (result) {
                vm.list = result;
            })
        }

        function getCote(jour, course) {
            programmeService.getCote(jour, course, function (result) {
                if (result.success) {
                    crudService.get("api/programme/" + jour, function (result) {
                        vm.item = result;
                    })
                } else {
                    console.log("error getCote : " + result.stderr);
                }

            });
        }

        function getResultat(jour, course) {
            programmeService.getResultat(jour, course, function (result) {
                if (result.success) {
                    crudService.get("api/programme/" + jour, function (result) {
                        vm.item = result;
                    })
                } else {
                    console.log("error getCote : " + result.stderr);
                }
            });
        }

        function openCalendar() {
            vm.isCalendarOpen = !vm.isCalendarOpen;
        }

        function setBulletChartData() {
            var measure = 0;
            var markers = 0;
            var nbCourse = 0;
            if (vm.item.reunions) {
                for (var r = 0; r < vm.item.reunions.length; r++) {
                    measure = measure + vm.item.reunions[r].coursesGagnees;
                    nbCourse += vm.item.reunions[r].courses.length;
                }
            }
            markers = (measure * 0.75).toFixed(0);
            console.log("markers ="  + markers);
           vm.bulletChartData = {
                "title": "Courses gagnées",
                "subtitle": "",
                "ranges": [0, parseInt(markers), nbCourse],
                "measures": [measure,5],
                "markers": [parseInt(markers)]
            }
        }
    }
})(); //fin  de l'anonymous wrapper

//service.js
(function () {
    angular
        .module('myApp')
        .service('programmeService', programmeService);

    programmeService.$inject = ['$http', '$location', '$q', '$window'];

    function programmeService($http, $location, $q, $window) {

        var api = {
            getCote: getCote,
            getResultat: getResultat,
        };





        function getCote(ajour, acourse, callback) {
                var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
                $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/get-cote' ,
                    method: 'POST',
                    data: { jour: ajour, course: acourse },
                    headers: { 'Content-Type': 'application/json; charset=UTF-8',
                    "x-access-token": userInfo.accessToken }
                }
                )
                .then(function (response) {
                    callback(response.data);
                })
                .catch(function (err) {
                    console.log("XHR failed for readFile." + err.data);
                });
        };

        function getResultat(ajour, acourse, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/get-resultat',
                    method: 'POST',
                    data: { jour: ajour, course: acourse },
                    headers: { 'Content-Type': 'application/json; charset=UTF-8',
                    "x-access-token": userInfo.accessToken }
                }
                )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl create error " + response.statusText);
                });
        };


        return api;
    }
})();

(function () {  // anonymous wrapper pour que la varaible soit locale et non global
    'use strict';

    angular
        .module('myApp')
        .controller('rapportControleur', rapportControleur);


    rapportControleur.$inject = ["$scope", "$timeout", "$http", "$location", '$routeParams', '$parse', '$filter', '$document', 'crudService', 'rapportService', '$window'];

    function rapportControleur($scope, $timeout, $http, $location, $routeParams, $parse, $filter, $document, crudService, rapportService, $window) {

        var vm = this;
        vm.list = [];
        vm.item = {};
        vm.datejour = new Date();
        vm.status = {
            isFirstOpen: true
        }
        vm.getCote = getCote;
        vm.getResultat = getResultat;
        
        vm.histo = [{
            key: "1er cote joué",
            values: []
        },
        {
            key: "2nd cote joué",
            values: []
        }
        ];
        vm.solde = [{
            key: "1er cote joué",
            values: []
        },
        {
            key: "2nd cote joué",
            values: []
        }
        ];

        //Constructor

        var rapport = {};
        rapport.solde = 47.5;
        rapport.rapportDuJour = 5.6;
        rapport.miseDuJour = 25;

        vm.item = rapport;
        $timeout(function ()  {
            
            vm.optionHisto = {
                chart: {
                    type: 'lineChart',
                    height: 300,
                    margin: {
                        top: 20,
                        right: 40,
                        bottom: 60,
                        left: 55
                    },
                    x: function (d) { return d.quantieme.substr(0,2); },
                    y: function (d) { return d.value.toFixed(2)},
                    yDomain: [-50, +50],
                    showValues: false,
                    /*
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },*/
                    transitionDuration: 500,
                    xAxis: {
                        axisLabel: 'X Axis',
                        yAxis: {
                            axisLabel: 'Y Axis',
                            axisLabelDistance: 30
                        }

                    }
                }
            };
        }, 3000);
        $timeout(function ()  {
            
            vm.optionSolde = {
                chart: {
                    type: 'lineChart',
                    height: 300,
                    margin: {
                        top: 20,
                        right: 40,
                        bottom: 60,
                        left: 55
                    },
                    x: function (d) { return d.quantieme.substr(0,2); },
                    y: function (d) { return d.value.toFixed(2)},
                    yDomain: [-50, +50],
                    showValues: false,
                    /*
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },*/
                    transitionDuration: 500,
                    xAxis: {
                        axisLabel: 'X Axis',
                        yAxis: {
                            axisLabel: 'Y Axis',
                            axisLabelDistance: 30
                        }

                    }
                }
            };
        }, 3000)


        var today = new Date();
        var aDayBefore = new Date();
        var aDayBefore2 = new Date();
/*
        aDayBefore.setDate(today.getDate() - 2);
        
        rapportService.getHisto(formatDate(aDayBefore), function (histo) {
            vm.histo[0].values[0] = { "quantieme": formatDate(aDayBefore), "value": histo.algo1.toFixed(2) };
            vm.histo[1].values[0] = { "quantieme": formatDate(aDayBefore), "value": histo.algo2.toFixed(2) };
        });
        aDayBefore2.setDate(today.getDate() - 1);
        rapportService.getHisto(formatDate(aDayBefore2), function (histo) {
            vm.histo[0].values[1] = { "quantieme": formatDate(aDayBefore2), "value": histo.algo1.toFixed(2) };
            vm.histo[1].values[1] = { "quantieme": formatDate(aDayBefore2), "value": histo.algo2.toFixed(2) };

            vm.histo[0].values[2] = { "quantieme": formatDate(today), "value": 0 };
            vm.histo[1].values[2] = { "quantieme": formatDate(today), "value": 0 };
        });*/
		rapportService.getHisto(formatDate(aDayBefore),  (histo) => {
            vm.histo = histo;
        });
        rapportService.getSolde((solde) => {
            vm.solde = solde;
        });
        /*
                for (var d = 0; d <= 10; d++) {
                    aDayBefore.setDate(today.getDate() - (10 - d));
                    rapportService.getHisto(formatDate(aDayBefore),  (histo) => {
                        vm.histo[0].values.push(histo.key0);
                        vm.histo[1].values.push(histo.key1);
                    });
                }
*/
        function formatDate(day) {
            var mo = parseInt(day.getMonth()) + 1;
            var strMo = ((mo > 9) ? mo + 1 : "0" + mo);
            var strDay = day.getDate() > 9? day.getDate() : "0" + day.getDate();
            return strDay + strMo + day.getFullYear();
        }


        function getItem() {
            crudService.get(apiGet, function (result) {
                vm.item = result;
            })
        }
        function getList() {
            crudService.get(apiList, function (result) {
                vm.list = result;
            })
        }

        function getCote(jour, course) {
            programmeService.getCote(jour, course, function (result) {
                if (result.success) {
                    crudService.get("api/programme/" + jour, function (result) {
                        vm.item = result;
                    })
                } else {
                    console.log("error getCote : " + result.stderr);
                }

            });
        }

        function getResultat(jour, course) {
            programmeService.getResultat(jour, course, function (result) {
                if (result.success) {
                    crudService.get("api/programme/" + jour, function (result) {
                        vm.item = result;
                    })
                } else {
                    console.log("error getCote : " + result.stderr);
                }
            });
        }

        function openCalendar() {
            vm.isCalendarOpen = !vm.isCalendarOpen;
        }

    }

})(); //fin  de l'anonymous wrapper

//service.js
(function () {
    angular
        .module('myApp')
        .service('rapportService', rapportService);

    rapportService.$inject = ['$http', '$location', '$q', '$window'];

    function rapportService($http, $location, $q, $window) {

        var api = {
            getCote: getCote,
            getResultat: getResultat,
            getHisto: getHisto,
            getSolde: getSolde
        };




        function getHisto(day, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/rapport',
                    method: 'POST',
                    data: { jour: day},
                    headers: { 'Content-Type': 'application/json; charset=UTF-8',
                    "x-access-token": userInfo.accessToken }
                }
                )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl create error " + response.statusText);
                });
        }

        function getSolde(callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/solde',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8',
                    "x-access-token": userInfo.accessToken }
                }
                )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl create error " + response.statusText);
                });
        }

        function getCote(ajour, acourse, callback) {
                var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
                $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/get-cote' ,
                    method: 'POST',
                    data: { jour: ajour, course: acourse },
                    headers: { 'Content-Type': 'application/json; charset=UTF-8',
                    "x-access-token": userInfo.accessToken }
                }
                )
                .then(function (response) {
                    callback(response.data);
                })
                .catch(function (err) {
                    console.log("XHR failed for readFile." + err.data);
                });
        };

        function getResultat(ajour, acourse, callback) {
            var userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            $http(
                {
                    url: 'http://' + location.hostname + ':3001/api/get-resultat',
                    method: 'POST',
                    data: { jour: ajour, course: acourse },
                    headers: { 'Content-Type': 'application/json; charset=UTF-8',
                    "x-access-token": userInfo.accessToken }
                }
                )
                .then(function (value) {
                    callback(value.data);
                }, function errorCallback(response) {
                    console.log("appCtrl create error " + response.statusText);
                });
        };


        return api;
    }
})();

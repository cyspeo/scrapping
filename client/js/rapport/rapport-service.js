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

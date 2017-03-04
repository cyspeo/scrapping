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

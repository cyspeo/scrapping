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

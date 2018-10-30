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

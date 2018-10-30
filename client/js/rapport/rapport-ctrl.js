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

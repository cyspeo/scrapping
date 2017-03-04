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

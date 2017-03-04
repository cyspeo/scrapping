var rapportTool = require("../lib/rapport");

var today = new Date();


function formatDate(day) {
    var mo = parseInt(day.getMonth())+1;
    return day.getDate() + ((mo > 9) ? mo+1 : "0"+mo) + day.getFullYear();
}
var Datastore = require('nedb') //base de donnees fichiers
var STORAGE_DIR = "../../storage";
var dbCourses = new Datastore({ filename: STORAGE_DIR + "/courses", autoload: true });

var today = new Date();
var aDayBefore = new Date();
    aDayBefore.setDate(today.getDate() - 1);

rapportTool.calculRapportUneJournee(dbCourses,"20022017",function (rapportJour) {
    console.log("rapport algo1 = "+rapportJour.algo1);
    console.log("rapport algo2 = "+rapportJour.algo2);
});


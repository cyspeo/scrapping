var rapportTool = require("../lib/rapport");

var today = new Date();


function formatDate(day) {
    var mo = parseInt(day.getMonth())+1;
    return day.getDate() + ((mo > 9) ? mo+1 : "0"+mo) + day.getFullYear();
}



var debut = new Date(2017,02,14);
var fin = new Date();

var aDayBefore = new Date();
aDayBefore = debut.setDate(debut.getDate() - 1);    




var Datastore = require('nedb') //base de donnees fichiers
var STORAGE_DIR = "../../storage";
var dbCourses = new Datastore({ filename: STORAGE_DIR + "/courses", autoload: true });


dbCourses.find({}, function (err, courses)  {
	if (err) throw err;
	var histo = rapportTool.makeHisto(debut, courses);
    console.log("resultat=" + JSON.stringify(histo));
});


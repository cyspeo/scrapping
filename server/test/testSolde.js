var rapportTool = require("../lib/rapport");
var fs = require("fs");

var debut = new Date(2017,02,14);

var Datastore = require('nedb') //base de donnees fichiers
var STORAGE_DIR = "../../storage";
var dbCourses = new Datastore({ filename: STORAGE_DIR + "/courses", autoload: true });


dbCourses.find({}, function (err, courses)  {
	if (err) throw err;
	var histo = rapportTool.suiviSolde(debut, courses);
	fs.writeFileSync('../histo.js', JSON.stringify(histo),'utf8');
    console.log("resultat=" + JSON.stringify(histo));
});


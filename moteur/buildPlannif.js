var Datastore = require('nedb')
,fs = require("fs");

console.log(" ");
console.log(" ");
console.log(" *** buildPlannif *** ");
//Check arguments

if (process.argv.length !== 3) {
  console.log('process.argv = ' + process.argv);
  console.log('Usage : node buildPlannif.js <jour> ');
	process.exit(1);
} else {
  process.argv.forEach(function(arg, i) {
    console.log(i + ': ' + arg);
  });
}


//Recuperation des course du jour


var dbName = "../storage/courses";
var jour = process.argv[2];

var db = new Datastore({ filename: dbName, autoload: true });

db.find({date:jour}, function (err, course) {
  if (!course) {
	console.log("Aucune course tourve" );
  	process.exit(1);	
  } 
  if (err) {
  	console.log("ERROR on find" + err);
  	process.exit(1);
  }
  var commandes = "#!/bin/bash\n";
  for (var i=0;i<course.length;i++) {
  	var uneCourse = course[i];
  	console.log("course N° "+uneCourse.nom);
  	if (uneCourse.heure) {
  		commandes += "at " + uneCourse.heure +' - 2 minutes <<< "./getCote.sh ' +  uneCourse.nom + " " + jour + '" \n' 
  		commandes += "at " + uneCourse.heure +' + 15 minutes <<< "./getRapport.sh ' +  uneCourse.nom + " " + jour + '" \n' 
  	}
  }
  
  fs.writeFile('./plannifGetCote.sh', commandes, (err) => {
  	if (err) throw err;
  	//console.log("Plannif done");
  	process.exit(0);
  });
  

});
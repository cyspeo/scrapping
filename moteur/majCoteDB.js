var Datastore = require('nedb')
, fs = require("fs");



if (process.argv.length !== 6) {
  console.log('process.argv = ' + process.argv);
  console.log('Usage : node majCoteDB.js <input_json> <jour> <course> <db name>');
  process.exit(1);
} 

var dbName = process.argv[5];
//console.log("fichier cote = " + process.argv[2]);
//var cote = require(process.argv[2]);
var cote;
try {
 cote = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
} catch (err) {
	console.log("Erreur lectuer cote: " + err);
	process.exit(1);
}
//console.log("cote=" + JSON.stringify(cote));
var nom=process.argv[4];
var jour = process.argv[3]


var db = new Datastore({ filename: dbName, autoload: true });

//console.log("nom="+nom+"  jour="+jour);  
db.find({nom:nom,date:jour}, function (err, course) {
  if (!course) {
	console.log("Aucune course trouve" );
  	process.exit(1);	
  } else if (course.length > 1) {
  	console.log("Plusieurs courses tourves" );
  	process.exit(1);	
  }
  if (err) {
  	console.log("ERROR on find" + err);
  	process.exit(1);
  }
  //console.log("course trouve=" + JSON.stringify(course));
  for (var i=0;i<course[0].chevaux.length;i++) {
     for (var j=0;j<cote.chevaux.length;j++) {
     
         if (course[0].chevaux[i].numero === cote.chevaux[j].numero) {
         	course[0].chevaux[i].cote= cote.chevaux[j].cote;
         	break;
         }
      }
  }
  course[0].majcote = true;

  // Choix du pari
  var meilleurCote  =99999;
	var numeroChoisi;
	for (var i=0;i<course[0].chevaux.length;i++) {
		var laCote = parseFloat(course[0].chevaux[i].cote);
		
		if (laCote != NaN) {
			if (laCote < meilleurCote) {
				meilleurCote = laCote
				numeroChoisi = course[0].chevaux[i].numero
			}
		}
		//console.log("cote="+course[0].chevaux[i].cote+ " laCote="+laCote+ " meilleurCote= " + meilleurCote);
  	}	
  	if (numeroChoisi) {
  		course[0].pari = {};
  		course[0].pari.type = "Simple placé";
  		course[0].pari.numero = numeroChoisi;
  		course[0].pari.valeur = 1;
  		course[0].pari.meilleurCote = meilleurCote;
  	}
  // Maj de la base	
  //console.log("course.length " + course.length+ "MAJ DB " + JSON.stringify(course));
  db.update({date:course[0].date, nom:course[0].nom},course[0],{}, function(err, numReplaced){
  	if (err) {
  		console.log("Error on update course" + err);
  	} else {
  		console.log("Update course "+jour+" "+nom+" ok");
  	}
  })
});



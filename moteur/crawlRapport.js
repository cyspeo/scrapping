var fs = require("fs");
var cheerio = require('cheerio');
var Datastore = require('nedb');



if (process.argv.length !== 4) {
  console.log('args = ' + process.argv);
  console.log('Usage : node crawlRapport.js <date> <course>');
  process.exit(1);
}
var nom = process.argv[3];
var jour = process.argv[2];
var url = "./"+process.argv[2]+"/pages/"+process.argv[3]+".html";
var output = "./"+process.argv[2]+"/data/"+process.argv[3]+".json";
console.log("outout="+output);
var file = fs.readFileSync(url, 'utf8');
var $ = cheerio.load(file)

/**
* Debut crawl
*/


var courseCrawled = {};
courseCrawled.chevaux = [];


var annule = $(".img-course-annulee").length;
if (annule) {
	courseCrawled.status = "Annulé";
}
if (!annule) {
	var termine = ($("#infos-arrivee>.infos-arrivee-content").length);
	if (!termine) {
   		courseCrawled.status = "Non terminé";
	} else {
		courseCrawled.status = "terminé";
	}
} else {
	termine = false;
}

var titreDate = $("h2.course-title").text();
var i = titreDate.indexOf("-");
courseCrawled.heure = titreDate.substr(i+1,6).replace("h",":");

/** 
 * Pour chaque cheval on récupère son arrive et son rapport
 **/ 
if (termine) {
$("tbody tr.ligne-participant").each(function (index, obj) {

	var cheval = {};
	if ($(this).hasClass("non-partant")) {
		cheval.participation = false;
		$(this).find("td").each(function (ind, obj) {
			if (ind === (1)) {
				cheval.numero = $(this).find("strong").text();
			}
		});
	} else {
		cheval.participation = true;
		$(this).find("td").each(function (ind1, obj) {
			if (ind1 === (0)) {
				//cheval.arrive=$(this).text().trim().substr(0,1);
				cheval.arrive = index + 1;
			} if (ind1 === (1)) {
				cheval.numero = $(this).find("strong").text();
			}
		});
	}
	$(this).find("td.rapport-probable").each(function (i, o) {
		cheval.cote = parseFloat($(this).text().replace(",", "."));
	});
	courseCrawled.chevaux.push(cheval);
});




//Pour chaque cheval
$(".rapports-probables-table tbody tr").each(function (index, obj) {
  if (!$(this).hasClass("non-partant")) {
    var horse = {};
    $(this).find("td").each(function (ind, obj) {
     	if (ind === 0) {
     		horse.numero = $(this).find("strong").text();
     	} else if (ind === (4)) {
      	   var simpleplace = $(this).text();
      	   var tiretPos = simpleplace.indexOf("-");
      	   var strRapportMin = simpleplace.substr(0,tiretPos-1).trim();
      	   var strRapportMax = simpleplace.substr(tiretPos+1).trim();
      	   horse.rapportMin = parseFloat(strRapportMin.replace(",","."));
      	   horse.rapportMax = parseFloat(strRapportMax.replace(",","."));
        } 
    });
    
    //Il faut mettre à jour le cheval dans l'objet courseCrawled
    for (var ch=0; ch < courseCrawled.chevaux.length ; ch++) {
    	if (courseCrawled.chevaux[ch].numero === horse.numero) {
    		courseCrawled.chevaux[ch].rapportMin = horse.rapportMin;
    		courseCrawled.chevaux[ch].rapportMax = horse.rapportMax;
    		break;
    	}
    }
   }
});
} //fin if termine
//console.log("course="+JSON.stringify(course));
fs.writeFileSync(output, JSON.stringify(courseCrawled),'utf8');
//console.log("crawlRapport exit fine!")

var dbName = "../storage/courses";
var db = new Datastore({ filename: dbName, autoload: true });
//console.log("nom="+nom+"  jour="+jour);  
db.find({nom:nom,date:jour}, function (err, course) {
  if (!course) {
	console.log("Aucune course tourve" );
  	process.exit(1);	
  } else if (course.length > 1) {
  	console.log("Plusieurs courses tourves" );
  	for (var c=0;c<course.length;c++) {
  		console.log("Nom="+course[c].nom + "  date=" + course[c].date  + " id=" + course[c]._id );
  	}
  	//process.exit(1);	
  }
  if (err) {
  	console.log("ERROR on find" + err);
  	process.exit(1);
  }
  course[0].status = courseCrawled.status;
  if (!annule) {
  for (var i=0;i<course[0].chevaux.length;i++) {
     for (var j=0;j<courseCrawled.chevaux.length;j++) {
     
         if (course[0].chevaux[i].numero === courseCrawled.chevaux[j].numero) {
         	course[0].chevaux[i].cote= courseCrawled.chevaux[j].cote;
         	course[0].chevaux[i].arrive = courseCrawled.chevaux[j].arrive;
         	course[0].chevaux[i].rapportMin= courseCrawled.chevaux[j].rapportMin;
         	course[0].chevaux[i].rapportMax = courseCrawled.chevaux[j].rapportMax;
         	//console.log("MAJ " + JSON.stringify(course[0].chevaux[i]));
         	break;
         }  
      }
  }
  }

  db.update({date:course[0].date, nom:course[0].nom},course[0],{}, function(err, numReplaced){
  	if (err) {
  		console.log("Error on update course" + err);
  	} else {
  		console.log("Update course "+jour+" "+nom+" pour rapport done " + numReplaced); 
  	}
  })
});

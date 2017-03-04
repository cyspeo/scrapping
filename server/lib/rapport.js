

function calculRapportUneCourse(course) {
    var rapports = {};
    rapports.algo1 = 0;
    rapports.algo2 = 0;
    var algo1 = {};
    algo1.meilleurCote = 99999;
    var algo2 = {};
    algo2.meilleurCote = 99999;
    var arrive = [];
    var nbParticipant = course.chevaux.length;

    //console.log("calculRapportUneCourse pour " + course.nom);

    for (var cheval = 0; cheval < course.chevaux.length; cheval++) {
        var laCote = parseFloat(course.chevaux[cheval].cote);
        if (laCote != NaN) {
            if (laCote < algo1.meilleurCote) {
                algo1.meilleurCote = laCote;
                algo1.numeroCheval = course.chevaux[cheval].numero;
                if (course.chevaux[cheval].rapportMin) {
                    algo1.RapportMoy = (course.chevaux[cheval].rapportMin + course.chevaux[cheval].rapportMax) / 2;
                }
            }
            if (laCote > algo1.meilleurCote && laCote < algo2.meilleurCote) {
                algo2.meilleurCote = laCote;
                algo2.numeroCheval = course.chevaux[cheval].numero;
                if (course.chevaux[cheval].rapportMin) {
                    algo2.RapportMoy = (course.chevaux[cheval].rapportMin + course.chevaux[cheval].rapportMax) / 2;
                }
            }
        }
        if (course.chevaux[cheval].arrive) {
            arrive[course.chevaux[cheval].arrive - 1] = course.chevaux[cheval].numero;
        }
    }
    
    if (nbParticipant > 8) {
        if (algo1.numeroCheval === arrive[0] || algo1.numeroCheval === arrive[1] || algo1.numeroCheval === arrive[2] || algo1.numeroCheval === arrive[3] || algo1.numeroCheval === arrive[4]) {
            rapports.algo1 = rapports.algo1 + (algo1.RapportMoy -1);
            //console.log(course.nom + " algo1 gangé ");
        } else {
            rapports.algo1 = rapports.algo1 - 1;
            //console.log(course.nom + " algo1 perdu ");
        }
        if (algo2.numeroCheval === arrive[0] || algo2.numeroCheval === arrive[1] || algo2.numeroCheval === arrive[2] || algo2.numeroCheval === arrive[3] || algo2.numeroCheval === arrive[4]) {
            rapports.algo2 = rapports.algo2 + (algo2.RapportMoy-1);
            //console.log(course.nom + " algo2 gangé ");
        } else {
            rapports.algo2 = rapports.algo2 - 1;
            //console.log(course.nom + " algo2 perdu ");
        }
    } else {
        if (algo1.numeroCheval === arrive[0] || algo1.numeroCheval === arrive[1] || algo1.numeroCheval === arrive[2]) {
            rapports.algo1 = rapports.algo1 + (algo1.RapportMoy -1);
            //console.log(course.nom + " algo1 gagné ");
        } else {
            rapports.algo1 = rapports.algo1 - 1;
            //console.log(course.nom + " algo1 perdu ");
        }
        if (algo2.numeroCheval === arrive[0] || algo2.numeroCheval === arrive[1] || algo2.numeroCheval === arrive[2]) {
            rapports.algo2 = rapports.algo2 + (algo2.RapportMoy - 1);
            //console.log(course.nom + " algo2 gagné ");
        } else {
            rapports.algo2 = rapports.algo2 - 1;
            //console.log(course.nom + " algo2 perdu ");
        }
    }
    return rapports;
}

function calculRapportUneJournee(dbCourses, day, callback) {
        console.log("Calcul du rapport pour le " + day);
        dbCourses.find({ date: day }).sort({ nom: 1 }).exec(function (err, courses) {
        	//console.log("calculRapportUneJournee courses.length" + courses.length);
            if (err) throw err;
            var rapportJour = {};        
            rapportJour.algo1 = 0;
            rapportJour.algo2 = 0;
            if (!courses) {
                callback(rapportJour);
            }
            for (var c = 0; c < courses.length; c++) {
                //console.log("Course " + courses[c].nom);
                var rapportCourse = calculRapportUneCourse(courses[c]);
                //console.log("rapport course = " + rapportCourse.algo1);
                if (rapportCourse.algo1) {
                	rapportJour.algo1 = rapportJour.algo1 + rapportCourse.algo1;
                } else {
                	console.log(" course " + courses[c].nom + " rapport algo 1KO");
                }
                if (rapportCourse.algo2) {
                	rapportJour.algo2 = rapportJour.algo2 + rapportCourse.algo2;
                } else {
                	console.log(" course " + courses[c].nom + " rapport algo 2KO");
                }
            }
            callback(rapportJour);
        });
}

function getWinningsByDay(courses) {
	 var rapportJour = {};        
     rapportJour.algo1 = 0;
     rapportJour.algo2 = 0;
     if (!courses) {
         return rapportJour;
     }
     for (var c = 0; c < courses.length; c++) {
        //console.log("Course " + courses[c].nom);
        var rapportCourse = calculRapportUneCourse(courses[c]);
        //console.log("rapport course = " + rapportCourse.algo1);
        if (rapportCourse.algo1) {
           	rapportJour.algo1 = rapportJour.algo1 + rapportCourse.algo1;
        } else {
           	console.log(" course " + courses[c].nom + " rapport algo 1KO");
        }
        if (rapportCourse.algo2) {
         	rapportJour.algo2 = rapportJour.algo2 + rapportCourse.algo2;
            } else {
            	console.log(" course " + courses[c].nom + " rapport algo 2KO");
            }
     }
     return rapportJour;
}

function suiviSolde(debut, courses) {
		var listeAlgo1 = [];
	var listeAlgo2 = [];
	
	function comparateur(a,b)
	{
		var dateA = new Date(a.date.substr(4,4),a.date.substr(2,2),a.date.substr(0,2));
		var dateB = new Date(b.date.substr(4,4),b.date.substr(2,2),b.date.substr(0,2));
	
		if (dateA < dateB) return -1;
		if (dateA > dateB) return 1;
		if (a.nom < b.nom) return -1
		if (a.nom > b.nom) return 1
		return 0;
	}	
	courses.sort(comparateur);
	var histo = [{
            key: "1er cote joué",
            values: []
        },
        {
            key: "2nd cote joué",
            values: []
        }
    ];
    var courseForADay = [];
    var previousDate = debut;
    var previousAlgo1Value = 0;
    var previousAlgo2Value = 0;
	for (var j = 0; j< courses.length; j++) {
		
		var date = new Date(courses[j].date.substr(4,4),courses[j].date.substr(2,2),courses[j].date.substr(0,2));
		if (date >= debut) {
			// on est sur qu'il y a des donnees
			if (date > previousDate) {
				//rupture de journee
				rapportJour = getWinningsByDay(courseForADay);
				var itemAlgo1 = {};
				itemAlgo1.quantieme = courses[j].date;
				itemAlgo1.value = rapportJour.algo1;
				var itemAlgo2 = {};
				itemAlgo2.quantieme = courses[j].date;
				itemAlgo2.value = rapportJour.algo2;
			
				itemAlgo1.value = itemAlgo1.value + previousAlgo1Value;
				itemAlgo2.value = itemAlgo2.value + previousAlgo2Value;
				histo[0].values.push(itemAlgo1);
				histo[1].values.push(itemAlgo2);	
				var previousAlgo1Value = parseFloat(rapportJour.algo1); 
				var previousAlgo2Value = parseFloat(rapportJour.algo2);
				
				previousDate = date;
				courseForADay.splice(0, courseForADay.length);
			} else {
				courseForADay.push(courses[j]);
			}
			//console.log("date " + date + " " + courses[j].date.substr(4,4) + "-" + courses[j].date.substr(2,2) + "-" + courses[j].date.substr(0,2) + ", " + courses[j].nom);
			
   			//console.log("rapport algo1 = "+rapportJour.algo1);
   			//console.log("rapport algo2 = "+rapportJour.algo2);
		}
	};
	return histo;
}

function makeHisto(debut, courses) {
	var listeAlgo1 = [];
	var listeAlgo2 = [];
	
	function comparateur(a,b)
	{
		var dateA = new Date(a.date.substr(4,4),a.date.substr(2,2),a.date.substr(0,2));
		var dateB = new Date(b.date.substr(4,4),b.date.substr(2,2),b.date.substr(0,2));
	
		if (dateA < dateB) return -1;
		if (dateA > dateB) return 1;
		if (a.nom < b.nom) return -1
		if (a.nom > b.nom) return 1
		return 0;
	}	
	courses.sort(comparateur);
	var histo = [{
            key: "1er cote joué",
            values: []
        },
        {
            key: "2nd cote joué",
            values: []
        }
    ];
    var courseForADay = [];
    var previousDate = debut;
    
	for (var j = 0; j< courses.length; j++) {
		
		var date = new Date(courses[j].date.substr(4,4),courses[j].date.substr(2,2),courses[j].date.substr(0,2));
		if (date >= debut) {
			// on est sur qu'il y a des donnees
			if (date > previousDate) {
				//rupture de journee
				rapportJour = getWinningsByDay(courseForADay);
				var itemAlgo1 = {};
				itemAlgo1.quantieme = courses[j].date;
				itemAlgo1.value = rapportJour.algo1;
				var itemAlgo2 = {};
				itemAlgo2.quantieme = courses[j].date;
				itemAlgo2.value = rapportJour.algo2;
			
				histo[0].values.push(itemAlgo1);
				histo[1].values.push(itemAlgo2);	
				
				previousDate = date;
				courseForADay.splice(0, courseForADay.length);
			} else {
				courseForADay.push(courses[j]);
			}
			//console.log("date " + date + " " + courses[j].date.substr(4,4) + "-" + courses[j].date.substr(2,2) + "-" + courses[j].date.substr(0,2) + ", " + courses[j].nom);
			
   			//console.log("rapport algo1 = "+rapportJour.algo1);
   			//console.log("rapport algo2 = "+rapportJour.algo2);
		}
	};
	return histo;
}

exports.makeHisto = makeHisto;
exports.suiviSolde = suiviSolde;
exports.calculRapportUneJournee = calculRapportUneJournee;
exports.getWinningsByDay = getWinningsByDay;
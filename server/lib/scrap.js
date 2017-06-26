var database = require('./daoMongoDb.js');
var fs = require("fs");
var cheerio = require('cheerio');
var _ = require('lodash');
/**
 * Analyse la page journee pour en extraire la liste des réunion/course avec leurs urls
 * 
 * @param {string} path, Chemin du fichier html contenu l'extraction web
 * @param {string JJMMAA} date, Date d ela reunion
 * @return void
 **/
exports.scrapJournee = function (path, date) {
    console.log("scrapJournee " + path + "  " + date);
    var journee = {};
    // Initialize connection
    database.connect(function () {
        database.findJournee(date, function (doc) {

            //console.log("scrapJournee doc=" + doc.length);
            if (doc.length > 0) {
                journee = doc[0];
                //console.log("journee trouve en base")
            } else {
                //console.log("journee non trouve en base");
            }

            //Lecture du fichier html
            var file = fs.readFileSync(path, 'utf8');
            var $ = cheerio.load(file)

            var datestr = $("a.timeline-course-link").attr("href").substring(0, 8);
            journee.date = new Date(datestr.substr(4, 4), (parseInt(datestr.substr(2, 2)) - 1), datestr.substr(0, 2));
            journee.courselink = [];
            $("a.timeline-course-link").each(function (index, obj) {
                journee.courselink.push($(this).attr("href"));
            });
            var reunions = [];
            $(".reunion-infos-resume").each(function (index, obj) {
                var reu = {};
                reu.numero = $(this).find(".reunion-infos-numero span").text()
                reu.ville = $(this).find("p span").text();
                reunions.push(reu);
            });
            journee.reunions = reunions;
            //console.log("mise à jour journee");
            database.saveJournee(journee, function (doc) {
                console.log("ok");
                database.close();
            });
        });
    });
};

/**
 * Analyse la page course pour returner un objet contenu les info d el acourse, la liste des chevaux et pour chaqu'un leurs cotes et rapport probable.
 * La fonction commence par recherche l'existence de l acourse en base pour en faire des mise à jour si elle existe. 
 * Dans le cas d'une mise à jour, les cotes seront ajouter dans la liste de cote d'un cheval.
 * 
 * @param {string} path, Chemin du fichier html contenu l'extraction web
 * @param {string JJMMAA} date, Date de l acourse
 * @param {string} nom, nom de la course
 * @return void
 **/
exports.scrapCourse = function (path, date, nom) {
    console.log("scrapCourse " + path + "  " + date + "  " + nom);
    var course = {};
    database.connect(function () {
        database.findCourse(date, nom, function (docs) {
            if (docs.length > 0) {
                course = docs[0];
                console.log("course trouve en base")
            } else {
                course.chevaux = [];
                course.date = new Date(date.substr(4, 4), (parseInt(date.substr(2, 2)) - 1), date.substr(0, 2));
                course.nom = nom;
                console.log("course non trouve en base")
            }

            //Lecture du fichier html
            var file = fs.readFileSync(path, 'utf8');
            var $ = cheerio.load(file)
            var termine = false;

            var annule = $(".img-course-annulee").length;
            if (annule) {
                course.status = "Annulé";
            }
            if (!annule) {
                termine = ($("#infos-arrivee>.infos-arrivee-content").length);
                if (!termine) {
                    course.status = "Non terminé";
                } else {
                    course.status = "terminé";
                }
            } else {
                termine = false;
            }

            var titreDate = $("h2.course-title").text();
            var i = titreDate.indexOf("-");
            course.heure = titreDate.substr(i + 1, 6).replace("h", ":");

            var offset = 0;
            if (termine) {
                offset = 1;
            }

            //Pour chaque cheval on récupère sa cote, son arrive (si course termine)  et son rapport probable
            $("tbody tr.ligne-participant").each(function (index, obj) {

                var cheval = {};
                cheval.cote = [];

                if ($(this).hasClass("non-partant")) {
                    cheval.participation = false;
                    $(this).find("td").each(function (ind, obj) {
                        if (ind === (0 + offset)) {
                            cheval.numero = $(this).find("strong").text();
                        } else if (index === (1 + offset)) {
                            cheval.nom = $(this).find("span.name").attr("title").substring(17);
                        }
                    });
                } else {
                    cheval.participation = true;
                    $(this).find("td").each(function (ind1, obj) {
                        if (termine && ind1 === 0) {
                            cheval.arrive = index + 1;
                        }
                        if (ind1 === (0 + offset)) {
                            cheval.numero = $(this).find("strong").text();
                        } else if (ind1 === (1 + offset)) {
                            cheval.nom = $(this).find("span.name").attr("title").substring(17);
                        } else if (ind1 === (9 + offset)) {
                            cheval.musique = $(this).find("span").attr("title");
                        }
                    });
                }
                $(this).find("td.rapport-probable").each(function (i, o) {
                    cheval.cote.push(parseFloat($(this).text().replace(",", ".")));
                });
				
                var chIdx = _.findIndex(course.chevaux, { 'numero': cheval.numero });
                //console.log("course " + JSON.stringify(course) + " chIdx=" + chIdx);
                if (chIdx !== -1) {
                    course.chevaux[chIdx].participation = cheval.participation;
                    if (cheval.arrive) {
                        course.chevaux[chIdx].arrive = cheval.arrive;
                    }
                    course.chevaux[chIdx].cote.push(cheval.cote[0]);
                    course.chevaux[chIdx].musique = cheval.musique;
                } else {
                    course.chevaux.push(cheval)
                }
            });

            //Pour chaque cheval (rapport probables issu de la boite de dialogue.)
            $(".rapports-probables-table tbody tr").each(function (index, obj) {
                if (!$(this).hasClass("non-partant")) {
                    var horse = {};
                    $(this).find("td").each(function (ind, obj) {
                        if (ind === 0) {
                            horse.numero = $(this).find("strong").text();
                        } else if (ind === (4)) {
                            var simpleplace = $(this).text();
                            var tiretPos = simpleplace.indexOf("-");
                            var strRapportMin = simpleplace.substr(0, tiretPos - 1).trim();
                            var strRapportMax = simpleplace.substr(tiretPos + 1).trim();
                            horse.rapportMin = parseFloat(strRapportMin.replace(",", "."));
                            horse.rapportMax = parseFloat(strRapportMax.replace(",", "."));
                        }
                    });
                    var chIdx2 = _.findIndex(course.chevaux, { 'numero': horse.numero });
                    if (chIdx2 !== -1) {
                        course.chevaux[chIdx2].rapportMin = horse.rapportMin;
                        course.chevaux[chIdx2].rapportMax = horse.rapportMax;
                    } else {
                        console.log("Oops scrap course error on rapport probable")
                    }
                }
            });
            
            database.saveCourse(course, function (doc) {
                console.log("sauvegarde course date=" + course.date + " nom=" + course.nom + " _id=" + course._id);
                database.close();
            });
        });
    });

};
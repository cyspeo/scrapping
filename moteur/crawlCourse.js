var page = require('webpage').create();
var system = require('system');
var args = system.args;
var fs = require("fs");
var pwd = fs.workingDirectory;

console.log("");
console.log("*** CrawlCourse ***");
if (args.length !== 3) {
  console.log('args = ' + args);
  console.log('Usage : phantomjs crawlCourse.js <date> <RxCx>');
  phantom.exit();
} 

var url=pwd + "/" + args[1] + "/pages/" + args[2] + ".html";
var urlJq=pwd + "/lib/jquery.min.js";
var output="./" + args[1] + "/data/" + args[2]+ ".json";

phantom.onError = function(msg, trace) {
	console.log("phantom ERROR :" + msg );
};

page.onError = function(msg, trace) {
	if (msg.indexOf("_oEa") === -1) {
		console.log("page ERROR : " + msg);
		phantom.exit(1);
	}
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};


//page.open('file:///D:/DONNEES/s0075231/MesDocs/Labo/xsl/scrapping/page1.html', function(status) {
page.open('file://'+url, function(status) {
  //console.log("Status: " + status);
  if(status === "success") {
  	page.includeJs("file://"+urlJq, function() {
  	//page.includeJs("file:///D:/DONNEES/s0075231/MesDocs/Labo/xsl/scrapping/jquery.min.js", function() {
		//console.log("Jquery injected: ");
  		var course = page.evaluate(function() {
            var course = {};
            //jour.log = $("a.timeline-course-link").first().text();
            var termine = ( $("#infos-arrivee>.infos-arrivee-content").length);
            var offset = 0;
            if (termine) {
            	offset = 1;
            }
            course.chevaux = [];
            var titreDate = $("h2.course-title").text();
            var i = titreDate.indexOf("-");
            course.heure = titreDate.substr(i+1,6).replace("h",":");
             
            $("tbody tr.ligne-participant").each(function(index, obj){
            	
            	var cheval = {};
            	if ($(this).hasClass( "non-partant" )) {
            		cheval.participation = false;
            		$(this).find("td").each(function(index, obj){
            			if (index === (0+offset)) {
            				cheval.numero=$(this).find("strong").text();
            			} else if (index === (1+offset)) {
            				cheval.nom = $(this).find("span.name").attr("title").substring(17);	
	            		}
            		});
            	} else {
            		cheval.participation = true;
            		$(this).find("td").each(function(index, obj){
            			if (index === (0+offset)) {
            				cheval.numero=$(this).find("strong").text();
            			} else if (index === (1+offset)) {
            				cheval.nom = $(this).find("span.name").attr("title").substring(17);		
            			} else if (index === (9+offset)) {
            			    cheval.musique=$(this).find("span").attr("title");
            			}
            		})
            	}
            	cheval.cote = parseFloat($(this).find("td.rapport-probable.last").text().replace(",","."));
                course.chevaux.push(cheval);
            });
      		return course;
      		
    	});
    	course.date = args[1];
        course.nom = args[2];
    	//console.log("Course " + JSON.stringify(course));
        fs.write(output, JSON.stringify(course), 'w');
    	phantom.exit(0);
  	});
  }  else {
  	  	console.log("open page failed.");
  		phantom.exit(1);
  }
  
});
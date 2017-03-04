var page = require('webpage').create();
var system = require('system');
var args = system.args;
var fs = require("fs");

var pwd = fs.workingDirectory;

if (args.length !== 2) {
  console.log('args = ' + args);
  console.log('Usage : phantomjs crawlReunion.js <date>');
  phantom.exit();
} else {
  args.forEach(function(arg, i) {
    console.log(i + ': ' + arg);
  });
}
var url = pwd + "/" + args[1] + "/pages/" + args[1] + ".html";
var urlJq = pwd + "/lib/jquery.min.js";
var refJour = args[1];


phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};
page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

//page.open('file:///D:/DONNEES/s0075231/MesDocs/Labo/xsl/scrapping/page1.html', function(status) {
page.open('file://'+url, function(status) {
  console.log("Status: " + status);
  if(status === "success") {
  	//page.includeJs("file:///D:/DONNEES/s0075231/MesDocs/Labo/xsl/scrapping/jquery.min.js", function() {
	page.includeJs("file://"+urlJq, function() {
		console.log("Jquery injected: ");
  		var journee = page.evaluate(function() {
            var jour = {};
            //jour.log = $("a.timeline-course-link").first().text();
            jour.date = $("a.timeline-course-link").attr("href").substring(0,8);
            jour.courselink = [];
            $("a.timeline-course-link").each(function(index, obj){
                jour.courselink.push($(this).attr("href"));
            });
  			var reunions = [];
  			$(".reunion-infos-resume").each(function(index, obj)
              {
                  var reu = {};
                  reu.numero = $(this).find(".reunion-infos-numero span").text()
                  reu.ville = $(this).find("p span").text();
                  reunions.push(reu);
              });
             jour.reunions = reunions; 
      		return jour;
      		
    	});
    	//console.log("Reunions " + JSON.stringify(journee));
        fs.write("./"+journee.date+"/data/"+refJour+'.json', JSON.stringify(journee), 'w');
        var commandes = "#!/bin/bash\n";
        commandes += "exec >> ./getJournee.log \n" 
        console.log("Preparation get course");
        for (var i=0;i < journee.courselink.length ;i++) {
        	var ref = journee.courselink[i].substring(9,11) + journee.courselink[i].substring(12)
        	//console.log("ecriture fichier " + ref);
        	//fs.write('./prepareGetCourse/'+ref+'-url.json', journee.courselink[i], 'w');
        	/*
        	commandes += "phantomjs getPage.js http://www.pmu.fr/turf/" +  journee.courselink[i] + " " + "./"+journee.date+"/pages/"+ref+".html &&";
        	commandes += "phantomjs crawlCourse.js " + journee.date + " " + ref + " && "; 
        	commandes += "node insertDB.js ./"+journee.date+"/data/"+ref+".json courses \n\n"
        	*/
        	commandes += "./getCourse.sh http://www.pmu.fr/turf/" +  journee.courselink[i] + " " + journee.date + " " + ref + " \n" 
        }
        commandes += "node buildPlannif.js " + journee.date + " \n"
        commandes += "./plannifGetCote.sh \n"
        commandes += "atq \n"
        fs.write('./runGetAllCourses.sh', commandes, 'w');
        console.log("Vous pouvez lancer le script : runCrawlCourses.sh maintenant ");
    	phantom.exit(0);
  	});
  } else {
  	  	console.log("open page failed.");
  		phantom.exit(1);
  }
  
});
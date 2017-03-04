var express = require('express')
    , http = require('http')
    , bodyParser = require('body-parser')
    , fs = require("fs")
    , app = express()
    , http_port = 3001
    , Datastore = require('nedb') //base de donnees fichiers
    , path = require('path')
    , join = require("path").join
    , nedb = require('nedb')
    , child_process = require("child_process")
    , rapportTool = require("./lib/rapport");

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file    
var morgan = require('morgan');

var STORAGE_DIR = "../storage";

console.log("__dirname = "+ __dirname);
/**
 *INITIALISATION d'EXPRESS
 *  
 **/
app.set('superSecret', config.secret); // secret variable    
//Répertoire exposé au public
app.use(express.static(path.join(__dirname, 'public')));

//app.set('superSecret', config.secret); // secret variable


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

console.log("express static " + __dirname + './public');

// use morgan to log requests to the console
app.use(morgan('dev'));


//app.use(express.static('../client'));
//app.use(bodyParser());
app.use(function (req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        //res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next()
});

/**
 * INITIALISATION DES ROUTES ASSOCIEE A LEUR BASE DE DONNEES
 * 
 */
 /*
var dbroutesReunions = dbtoexpress("reunions", { filename: join(process.cwd(), STORAGE_DIR, "%s.db") });
app.use("/api", dbroutesReunions);
var dbroutesCourses = dbtoexpress("courses", { filename: join(process.cwd(), STORAGE_DIR, "%s.db") });
app.use("/api", dbroutesCourses);
*/
//var dbReunions = new Datastore({ filename: STORAGE_DIR+"/reunions", autoload: true});
//var dbCourses = new Datastore({ filename: STORAGE_DIR+"/courses", autoload: true});
var dbUser = new Datastore({ filename: STORAGE_DIR+"/users", autoload: true });


var toto = {};
toto.name = "toto";
toto.password = "titi";
toto.profile = "user";
/*
dbUser.insert(toto, function (err, newDoc) {   
	console.log("users inserted");
});*/

// =======================
// routes ================
// =======================


// API ROUTES -------------------
// we'll get to these in a second
// get an instance of the router for api routes
var apiRoutes = express.Router();


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function (req, res) {
    //Find user
    dbUser.find({ name: req.body.name }, function (err, user) {
        if (err) throw err;
        if (user.length === 0) {
            console.log("user =" + JSON.stringify(user));
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user[0]) {

            // check if password matches
            console.log("user =" + JSON.stringify(user[0]));
            if (user[0].password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right
                // create a token
                var token = jwt.sign(user[0], app.get('superSecret'), {
                    //expiresInMinutes: 5 // expires in 5 minutes
                    expiresIn: 1440 * 06 // expires in 24 heures
                });
                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).json({
            success: false,
            message: 'No token provided.'
        });

    }
});


// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);


/**
 * REAQUETES NON PRISE EN COMPTE PAR dbtoexpress
 */
app.get('/api/programme/:date', function (req, res) {
	
	// pour être synchronisé avec les mises à jour des scripts, i lfaut recharger les bases à chaque appel de la requête.
	var dbReunions = new Datastore({ filename: STORAGE_DIR+"/reunions", autoload: true});
	var dbCourses = new Datastore({ filename: STORAGE_DIR+"/courses", autoload: true});
	
    var date = req.params.date;
    //    console.log("api/programme/" + date);
    var programme = {};
    var reunions = [];
    //date = "04022017";
    dbReunions.find({ date: date }, function (err, docs) {
        if (err) throw err;
		if (!docs[0] || !docs[0].reunions) {
			console.log("Aucun programme pour trouvé pour le " + date);
			return res.status(403).send({message: 'Aucun programme pour trouvé.'});
		}
        for (var a = 0; a < docs[0].reunions.length; a++) {
            var reunion = docs[0].reunions[a];
            reunions.push(reunion);
        }
        dbCourses.find({ date: date }, function (err, courses) {
            if (err) throw err;
            for (var a = 0; a < reunions.length; a++) {
                reunions[a].courses = [];
                reunions[a].coursesGagnees = 0;
                for (var c = 0; c < courses.length; c++) {
                    if (courses[c].nom.substr(0, 2) === reunions[a].numero) {
                        courses[c].arrivee = [];
                        for (var cheval = 0; cheval < courses[c].chevaux.length; cheval++) {
                            if (courses[c].chevaux[cheval].arrive) {
                                if (!isNaN(courses[c].chevaux[cheval].arrive)) {
                                    var index = parseInt(courses[c].chevaux[cheval].arrive, 10);
                                    courses[c].arrivee[index - 1] = courses[c].chevaux[cheval].numero;
                                }
                            }

                        }
                        courses[c].gagnee = false;
                        if (courses[c].pari) {
                            if (courses[c].pari.numero) {
                                if (courses[c].pari.numero === courses[c].arrivee[0] || courses[c].pari.numero === courses[c].arrivee[1] || courses[c].pari.numero === courses[c].arrivee[2]) {
                                    courses[c].gagnee = true;
                                    reunions[a].coursesGagnees++;
                                }
                            }
                        }
                        reunions[a].courses.push(courses[c]);
                    }
                }
            }
            programme.reunions = reunions;
            res.send(programme);
        });
    });
    
});


app.post('/api/get-cote', function (req, res) {
	console.log(`Starting directory: ${process.cwd()}`);
	try {
  		process.chdir('../moteur');
  		console.log(`New directory: ${process.cwd()}`);
	}
	catch (err) {
  		console.log(`chdir: ${err}`);
	}
	//process.chdir(path.resolve(__dirname + "../moteur/"));
	console.log("api/get-cote jour="+req.body.jour+" course="+req.body.course);
    child_process.exec('./getCote.sh ' + req.body.course + ' ' + req.body.jour, function (error, stdout, stderr) {
    	if (error) {
            console.error(`exec error: ${error}`);
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
		process.chdir('../server');
		res.send({success:true,message:"Recupèration cote terminé", stdout:stdout, stderr: stderr});
    });
});

app.post('/api/get-resultat', function (req, res) {
	//process.chdir(path.resolve(__dirname + "\\java"));
	console.log(`Starting directory: ${process.cwd()}`);
	try {
  		process.chdir('../moteur');
  		console.log(`New directory: ${process.cwd()}`);
	}
	catch (err) {
  		console.log(`chdir: ${err}`);
	}
    child_process.exec('./getRapport.sh '+req.body.course+' '+req.body.jour, function (error, stdout, stderr) {
    	if (error) {
            console.error(`exec error: ${error}`);
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
		process.chdir('../server');
		res.send({success:true,message:"Recupèration resultat terminé"});
    });
});

/**
 * Parcour les courses et calcul le gain chaque jour
 */
app.post('/api/rapport', function (req, res) {
	
	var dbCourses = new Datastore({ filename: STORAGE_DIR+"/courses", autoload: true});
	var debut = new Date(2017,02,14);
	dbCourses.find({}, function (err, courses)  {
		if (err) throw err;
		var histo = rapportTool.makeHisto(debut, courses);
		res.send(histo);
	});
});


/**
 * Parcour les courses et calcul le solde chaque jour
 */
app.post('/api/solde', function (req, res) {
	/*
	var dbCourses = new Datastore({ filename: STORAGE_DIR+"/courses", autoload: true});
	var debut = new Date(2017,02,14);
	dbCourses.find({}, function (err, courses)  {
		if (err) throw err;
		var histo = rapportTool.suiviSolde(debut, courses);
		res.send(histo);
	});*/
	console.log(__dirname + '/histo.js');
	fs.readFile(__dirname + '/histo.js', 'utf8', function (err, data) {
  		if (err) throw err;
  		var histo = JSON.parse(data);
  		res.send(histo);
	});
	
});

/**
 * 
 * LANCEMENT DU SERVEUR 
 */


app.listen(http_port);
console.log("Server Listening on " + http_port);
console.log("Go to  http://mon serveur:3001/ ");
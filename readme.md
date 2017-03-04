# Le projet

Le principe de se projet est récupèrer des données sur internet afin de les mettre en base et de les traiter plus tard. 
La difficulté est de "scrapper" des sites utilisant du javascript pour construre leurs page.
Il faut donc utiliser PhantomJs pour construire le rendu de la page puis effectuer la récupèration des données dans le DOM.

## Ressources
* Javascrit sous NodeJs
* PhantomJS

## Principe
*Le principe est d'enchainer plusieurs petit script qui vont 
** récupéer la page,
** "crawler" les données,
** insérer en base les données
** lire les données de premier niveau pour lancer des récupération sur d'autres page
1/ getPage    ecrit un fichier html en sortie
2/ insert en base le doc réunion
3/ lecture des réunions et lancement des script getPage pour chaque course
4/ pour chaque page course crawl des donnes et insertion en base
   
## Scrapping PMU
1. Page accueil ("www.pmu.fr/turf")
2.1 Récupèrer la liste des réunions du jour et la liste des urls de chaque course par réunion.
2. Page course ("www.pmu.fr/turf/<date>/<Rx>/<Cx>")
2.1 Liste des chevaux
2.2 Pronostique

## page course
liste chevaux : tr.ligne-participant
N° cheval:  tr.ligne-participant td.txtC
Nom : tr.ligne-participant td span.name
Driver: td[7]
musique: td[10]

Pronostic : #pronostic .pronostique-content .unit

 
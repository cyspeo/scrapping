#!/bin/bash
exec >> ./getJournee.log
#
#Récupère la page course avec la modale rapport pour une date et une course donnees
# le && permet d'enchaine la comande suivante qui si la prÃ©cÃ©dente renvoi un code retour ok
#
#$1= reference de la course au format urx/Cx
#$2= journee au format JJMMAAAA

if test -z "$1"
then
    echo "Usage getRapport.sh course [date]"
    echo "course = reference de la course au format RxCx"
    echo "date= date de la course au format JJMMAAAA Si absent date du jour"
    exit 1
fi    
if test -z "$2"
then
	datejour=$(date +%d%m%Y)
else
	datejour=$2
fi
echo "datejour= $datejour"
course=$1
phantomjs getRapport.js http://www.pmu.fr/turf/$datejour/${course:0:2}/${course:2:2} ./$datejour/pages/$1.html && node crawlRapport.js $datejour $1  


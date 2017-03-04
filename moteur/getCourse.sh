#!/bin/bash

#
#RÈcupËre la page course  pour une date et une course donnees
# le && permet d'enchaine la comande suivante qui si la pr√©c√©dente renvoi un code retour ok
#
#$1= url de la page au format url/JJMMAAAA/Rx/Cx
#$2= journee au format JJMMAAAA
#$3= reference de la course au format RxCx

if test $# -ne 3
then
     echo "Usage getCourse.sh <url> <date> <course> "
     echo "<url>= url de la page de la course"
     echo "<date>= date de la course au format JJMMAAAA"
     echo "<course> = reference de la course au format RxCx"
  fi
phantomjs getPage.js $1 ./$2/pages/$3.html  && phantomjs crawlCourse.js $2  $3  && node insertDB.js ./$2/data/$3.json ../storage/courses

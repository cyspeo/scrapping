#!/bin/bash
exec &> ./getJournee.log
#Récupère la page accueil avecc la liste des courses pour une date 

datejour=$1
if test $# -ne 1
then
     echo "Usage getJournee.sh <date> au format JJMMSSAA"
     echo "Execution avec la date du jourdate jour"
     datejour=$(date +%d%m%Y)
fi  
echo 'date jour=' $datejour
echo 'pwd=' $PWD

echo '***Recuperation journee ' $datejour    
phantomjs getPage.js http://www.pmu.fr/turf/$datejour ./$datejour/pages/$datejour.html
rc=$?; if [[ $rc != 0 ]]; then echo 'Error on getPage';  exit $rc; fi

echo '*** Crawl journee ' $datejour
node crawlJournee.js $datejour
rc=$?; if [[ $rc != 0 ]]; then echo 'Error on crawlJournee';  exit $rc; fi


#echo '*** run Crawl courses'
#chmod +x ./runGetAllCourses.sh
#./runGetAllCourses.sh > $datejour/runGetAllCourses.log

#at 9:30 tomorrow <<< "./getJournee.sh"

 


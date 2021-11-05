# ProjetOpenData
<h1> Projet de M2 MIASHS sur la création d'un serveur web Utilisant de l'OpenData </h1> <br>
Membres du groupe : Alaka Moulikatou, Cassan Mélodie, Moreno Jonathan, Salah Salah Karim , Theron Emmanuelle, klein Alexandre  <br>
<h2>Intitulé du projet : Evolution de la consommation électrique en fonction de la température </h2>
L'objectif de ce projet est de mieux comprendre comment les variations de températures impacte la consommation globale d'energie (éléctricité et/ou gaz) <br>
Pour cela, le but est de  pouvoir récupérer au format souhaité un fichier (JSON, XML ou RDF/XML) qui regroupe les informations concernant deux sources de données. <br>
Nous avons choisi de lier deux sources de données ayant en commun leur identifiant de région pour pouvoir récupérer les informations de consommations électrique et de température spécifiques à une ou plusieurs régions région et à une période donnée.<br>
<h2> Données utilisées : </h2>
  <li> Données énergétiques : <br>
  Ce jeu de données présente les courbes de consommation régionale d’électricité (par demi-heure en MW) et de gaz (par heure en MW PCS 0°C).
Périmètre électricité : France métropolitaine hors Corse. Les années 2013 à 2019 sont au statut définitif. Les données 2020 et 2021 sont au statut intermédiaire.
  Ces données sont sous la Licence Ouverte v2.0 (Etalab).
  Ces données sont produites par GRTgaz, RTE et Teréga. Elles sont hébérgées par Open Data Reseaux Energie<br>
 Les données sont accessibles via ce lien : <br>
  <href> https://opendata.reseaux-energies.fr/explore/dataset/consommation-quotidienne-brute-regionale/table/?disjunctive.code_insee_region&disjunctive.region&sort=date </href>

</li>
  <li> Données météorologiques : <br>
  Ce jeu de données présente les températures minimales, maximales et moyennes quotidiennes (en degré celsius), par région administrative française, du 1er janvier 2016 à aujourd'hui. Il est basé sur les mesures officielles du réseau de stations météorologiques françaises. La mise à jour de ce jeu de données est mensuelle. 
  Ces données sont sous la Licence Ouverte v2.0 (Etalab).
  Ces données sont produites par Weathernews France. Elles sont hébérgées par Open Data Reseaux Energie<br>Les données sont accessibles via ce lien : <br>
  <href>https://opendata.reseaux-energies.fr/explore/dataset/temperature-quotidienne-regionale/information/?disjunctive.region&sort=-date</href> <br>

</li>

  <h2> Stratégie de croisement des deux sources de données : </h2>
  Les deux sources de données présentent des informations sur les régions françaises administratives et contiennent  au moins une mesure par jour. Nous avons donc, choisi de croiser ces données selon le code insee de la région et en fonction de la date. <br>
  

URL d'accès à l'API : <br>
 <h2> Description de l'API : </h2>
  <li> L'adresse du serveur déployé est disponible à cette adresse : <href> https://projectopendata.herokuapp.com/ </href>
  <h3> Exemples de requête : </h3>
  
<li> Exemple 1: Les données de consommation énergétiques et de température dans la région Occitanie pour l'ensemble de l'année 2018 : <br>
https://projectopendata.herokuapp.com/regions/76/?date=2018
</li>
    
 <li> Exemple 2: Les données de consommation énergétiques et de température dans la région nouvelle aquitaine le 31 décembre 2017 : <br>
 https://projectopendata.herokuapp.com/regions/75/?date=2017-12-31
 </li>
    
  <li> Exemple 3: Les données de consommation énergétiques et de température dans la région Auvergne Rhône-Alpes pour toutes les dates disponibles : <br>
  https://projectopendata.herokuapp.com/regions/84
  </li>
<div>    
 <h3> Informations dans le header </h3>
 </div>   
 <li>Les langages demandés doivent être précisés dans le header avec la clé Accept-Language. (Seul le fr est supporté, l'erreur suivante sera renvoyée si un autre langage est demandé : "La seule langue supportée par l'API est le français. Merci de modifier le header "Accept-Language" par "fr", ou de le supprimer." </li>
 <div>   
     <li>Le format de sortie accepté doit également être précisé dans le header avec la clé Accept. Les valeurs de formats supportés sont : "application/json", "application/xml", "application/rdf+xml". Par défaut, un format json sera renvoyé. si le format n'est pas supporté, l'erreur "Mauvais format demandé dans le header "Accept". Les formats acceptés sont:\n- application/json (valeur par défaut)\n- application/xml\n- application/rdf+xml" sera renvoyée.</li>
</div>
   <h3> Structure du RDF/XML proposé en sortie de l'API : </h3>
  
  ![Schéma](Shema_rel.png)
  
  Il est possible de demander l'export des données au format RDF/XML. La construction de celui ci répond au schéma relationnel ci dessus. Les vocabulaires utilisés sont des vocabulaires validés par la commmunauté et disponible à cette adresse : <href>https://lov.linkeddata.es/dataset/lov/</href> <br>
  L'export RDF/XML de notre API a été validé avec l'outil RDF Validator du W3C <href>https://www.w3.org/RDF/Validator/</href> <br>
  
  <h2> Technologie et packages utilisés : </h2>
  <li> Le serveur a été codé en utilisant JavaScript. Il est hébergé sur Heroku. </li>
  <li> Nous avons utilisé les packages : node-js, express, fetch, js2xmlparser, promise. La version exacte des packeges utilisé est spécifié dans packge.json

    
  
  
  
 
  
  
  

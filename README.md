# ProjetOpenData
<h1> Projet de M2 MIASHS sur la création d'un serveur web Utilisant de l'OpenData </h1> <br>
Membres du groupe : Alaka Moulikatou, Cassan Mélodie, Jonathan Moreno, Karim Salah Salah, Emmanuelle Theron Alexandre klein <br>
<h2>Intitulé du projet : Evolution de la consommation électrique en fonction de la température </h2>
Le but de ce projet est de  pouvoir récupérer au format souhaité un fichier (JSON, XML ou RDF/XML) qui regroupe les informations concernant deux sources de données. <br>
Nous avons choisi de lier deux sources de données ayant en commun leur identifiant de région pour pouvoir récupérer les informations de consommations électrique et de température spécifiques à une ou plusieurs régions région et à une période donnée.<br>
<h2> Données utilisées : </h2>
  <li> Données énergétiques : <br>
  Ce jeu de données présente les courbes de consommation régionale d’électricité (par demi-heure en MW) et de gaz (par heure en MW PCS 0°C).
Périmètre électricité : France métropolitaine hors Corse. Les années 2013 à 2019 sont au statut définitif. Les données 2020 et 2021 sont au statut intermédiaire. <br>
 Les données sont accessibles via ce lien : <br>
  <href> https://opendata.reseaux-energies.fr/explore/dataset/consommation-quotidienne-brute-regionale/table/?disjunctive.code_insee_region&disjunctive.region&sort=date </href>

</li>
  <li> Données météorologiques : <br>
  Ce jeu de données présente les températures minimales, maximales et moyennes quotidiennes (en degré celsius), par région administrative française, du 1er janvier 2016 à aujourd'hui. Il est basé sur les mesures officielles du réseau de stations météorologiques françaises. La mise à jour de ce jeu de données est mensuelle. Les données sont accessibles via ce lien : <br>
  <href>https://opendata.reseaux-energies.fr/explore/dataset/consommation-quotidienne-brute-regionale/table/?disjunctive.code_insee_region&disjunctive.region&sort=date</href> <br>

</li>
URL d'accès à l'API : <br>
Description de l'API et de comment faire les requêtes : <br>

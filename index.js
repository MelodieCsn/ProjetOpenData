"use strict"; // pour faire du java script propre ( tout déclarer)

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const FORMATS = ["application/json", "application/xml", "application/rdf+xml"];

let formatDemande; //variable contenant le format demandé. Assigné en premier et renvoie une erreur si le format n'est pas bon (json par défaut)

app.use(function(req, res, next) {
  formatDemande = req.get('Accept');

  if (formatDemande === "*/*" || formatDemande === undefined || formatDemande === "") {
    formatDemande = "application/json";
    req.headers['accept'] = formatDemande;
  }
  
  if (!FORMATS.includes(formatDemande)) {
    let err = new Error("Mauvais format demandé dans le header \"Accept\".\nLes formats acceptés sont:\n- application/json (valeur par défaut)\n- application/xml\n- application/rdf+xml")
    err.statusCode = 400
    next(err)
  }
  next();
});


app.get('/api', function (req, res) {
  res.write('\nBienvenue sur petits emprunts bientôt en react !');
  res.end();
});

app.get('/api/regions', function (req, res) {
  let format = req.header('Accept');
  res.write(req.header('user-agent'));
  res.end();
});

app.get('/api/regions/:regionId', function (req, res) {
  res.write(req.params.regionId + "\n");
  res.write(req.query.city);
  res.end();
});

app.listen(PORT, function () {
  console.log('Serveur accessible sur le port ' + PORT);
});


app.use(function (err, req, res, next) {
  res.status(err.statusCode).send(err.message);
})
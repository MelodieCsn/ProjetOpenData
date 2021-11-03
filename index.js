"use strict"; // pour faire du java script propre ( tout déclarer)

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const FORMATS = ["application/json", "application/xml", "application/rdf+xml"];

app.use(function(req, res, next) {
  let format = req.get('Accept');

  if (format === "*/*" || format === undefined || format === "") {
    format = "application/json";
  }
  
  if (!FORMATS.includes(format)) {
    let err = new Error("Mauvais format demandé dans le header \"Accept\".\nLes formats acceptés sont:\n- application/json (valeur par défaut)\n- application/xml\n- application/rdf+xml")
    err.statusCode = 400
    next(err)
  }
  next();
});


app.get('/', function (req, res) {
  res.write('\nBienvenue sur petits emprunts bientôt en react !');
  res.end();
});

app.get('/regions', function (req, res) {
  res.write(req.header('user-agent'));
  res.end();
});

app.get('/regions/:regionId', function (req, res) {
  res.write(req.params.regionId);
  res.write(req.query.city);
  res.end();
});

app.listen(PORT, function () {
  console.log('Serveur accessible sur le port ' + PORT);
});


app.use(function (err, req, res, next) {
  res.status(err.statusCode).send(err.message);
})
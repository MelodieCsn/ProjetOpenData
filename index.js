const express = require('express');
const {fetchUrl} = require("fetch");
const js2xmlparser = require("js2xmlparser");
const app = express();
const PORT = process.env.PORT || 3000;

const FORMATS = ["application/json", "application/xml", "application/rdf+xml"];

let formatDemande; //variable contenant le format demandé. Assigné en premier et renvoie une erreur si le format n'est pas bon (json par défaut)
let langageDemande;
let date;

app.use(function(req, res, next) {
    formatDemande = req.get('Accept');
    langageDemande = req.get("Accept-Language");
    date = req.query.date;

    if (formatDemande === "*/*" || formatDemande === undefined || formatDemande === "") {
        formatDemande = "application/json";
        req.headers['accept'] = formatDemande;
    }

    if (!FORMATS.includes(formatDemande)) {
        let err = new Error("Mauvais format demandé dans le header \"Accept\".\nLes formats acceptés sont:\n- application/json (valeur par défaut)\n- application/xml\n- application/rdf+xml")
        err.statusCode = 400
        next(err)
    }

    if (!(langageDemande === undefined || langageDemande === "fr")) {
        let err = new Error("La seule langue supportée par l'API est le français. Merci de modifier le header \"Accept-Language\" par \"fr\", ou de le supprimer.");
        err.statusCode = 400;
        next(err);
    }

    if (date === undefined) {
        let err = new Error("Le paramètre \"date\" doit être renseigné dans l'URL sous la forme \"YYYY\", \"YYYY-MM\", ou \"YYYY-MM-DD\"\nLa date doit être comprise entre le 2016-01-01 et aujourd'hui.");
        err.statusCode = 400;
        next(err);
    }

    next();
});

app.get('/regions', function (req, res) {
    res.end();
});

app.get('/regions/:regionId', function (req, res) {
    let region = req.params.regionId;

    doApi(region, date, formatDemande, res);
});

app.use(function (err, req, res, next) {
    res.status(err.statusCode).send(err.message);
});

app.listen(PORT, function () {
    console.log('Serveur accessible sur le port ' + PORT);
});

function doApi (regionId, date, format, res) {
    let endOfUrl;
    let resultConso = {}; //json qu'on va remplir
    let conso = [];

    endOfUrl = `&refine.code_insee_region=${regionId}&refine.date=${date}`

    const urlConso = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=consommation-quotidienne-brute-regionale&q=&rows=1000&sort=date_heure&facet=date_heure&facet=code_insee_region&facet=region&facet=consommation_brute_electricite_rte` + endOfUrl;
    const urlTemp = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=temperature-quotidienne-regionale&q=&rows=1000&sort=-date&facet=date&facet=region` + endOfUrl;

    fetchUrl(urlConso,
        function(error, meta, body) {
            const parsed =  JSON.parse(body);
            const recordsConso =  parsed.records;

            fetchUrl(urlTemp,
                function(error2, meta2, body2) {
                    const parsed2 = JSON.parse(body2);
                    const recordsTemp = parsed2.records;


                    resultConso.region = regionId;
                    resultConso.periode = date;

                    recordsConso.forEach(function(recordsConso) {
                        recordsTemp.forEach(function(recordsTemp) {
                            if (recordsTemp.fields.date === recordsConso.fields.date) {
                                conso.push({
                                    date_mesure : recordsConso.fields.date,
                                    conso_rte : recordsConso.fields.consommation_brute_electricite_rte,
                                    region : recordsConso.fields.region,
                                    temperature : recordsTemp.fields.tmoy
                                })
                            }
                        })
                    })

                    resultConso.features = conso;

                    if (format === "application/json") {
                        res.json(resultConso);
                    } else if (format === "application/xml") {
                        res.send(js2xmlparser.parse("regions", resultConso));
                    } else if (format === "application/rdf+xml") {
                        res.send("");
                    }
                })
        })
}
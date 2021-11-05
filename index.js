const express = require('express');
const {fetchUrl} = require("fetch");
const js2xmlparser = require("js2xmlparser");
const app = express();
const PORT = process.env.PORT || 3000;

const FORMATS = ["application/json", "application/xml", "application/rdf+xml"];
const inseeRegions = {
    11: 'iledefrance',
    24: 'centrevaldeloire',
    27: 'bourgognefranchecomte',
    28: 'normandie',
    32: 'hautsdefrance',
    44: 'grandest',
    52: 'paysdelaloire',
    53: 'bretagne',
    75: 'nouvelleaquitaine',
    76: 'occitanie',
    84: 'auvergnerhonealpes',
    93: 'provencealpescotedazur',
}

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

    next();
});

app.get('/regions/:regionId', function (req, res, next) {
    let regionId = req.params.regionId;
    let regionInseeCodeWithName = Object.keys(inseeRegions).find(key => inseeRegions[key] === regionId);
    let codeInseeToApi;

    if (inseeRegions[regionId] === undefined && regionInseeCodeWithName === undefined) {
        let err = new Error("Le code région doit être un code INSEE de région de France métropolitaine (hors Corse) valide.\nLe nom de la région est également accepté, sans espace ni tirets.");
        err.statusCode = 400;
        res.status(err.statusCode).send(err.message);
    } else if (inseeRegions[regionId] === undefined) {
        codeInseeToApi = regionInseeCodeWithName
        doApi(codeInseeToApi, date, formatDemande, res);
    } else if (regionInseeCodeWithName === undefined) {
        codeInseeToApi = regionId
        doApi(codeInseeToApi, date, formatDemande, res);
    }
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
    if (date != null) {
        endOfUrl = `&refine.code_insee_region=${regionId}&refine.date=${date}`
    } else {
        endOfUrl = `&refine.code_insee_region=${regionId}`
    }


    const urlConso = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=consommation-quotidienne-brute-regionale&q=&rows=10000&sort=date_heure&facet=date_heure&facet=code_insee_region&facet=region&facet=consommation_brute_electricite_rte` + endOfUrl;
    const urlTemp = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=temperature-quotidienne-regionale&q=&rows=10000&sort=date&facet=date&facet=region` + endOfUrl;


    fetchUrl("https://www.data.gouv.fr/fr/datasets/r/b62434f5-8d40-4de3-a80c-2b93481dc2be",
        function (error3, meta3, body3) {
            const parsedMoney = JSON.parse(body3);

            fetchUrl(urlConso,
                function (error, meta, body) {
                    const parsed = JSON.parse(body);
                    const recordsConso = parsed.records;

                    fetchUrl(urlTemp,
                        function (error2, meta2, body2) {
                            const parsed2 = JSON.parse(body2);
                            const recordsTemp = parsed2.records;

                            resultConso.Publisher = "Open Data Réseaux Energies";
                            resultConso.region = regionId;
                            resultConso.periode = date;

                            parsedMoney.forEach(function (row) {
                                if (row["fields"]["type_de_budget"] === "Budget principal" && row["fields"]["reg_code"] === regionId) {
                                    resultConso.budgetParHabitant = row["fields"]["euros_par_habitant"];
                                }
                            })

                            recordsConso.forEach(function (recordsConso) {
                                recordsTemp.forEach(function (recordsTemp) {
                                    if (recordsTemp.fields.date === recordsConso.fields.date) {
                                        conso.push({
                                            Date_mesure: recordsConso.fields.date,
                                            Region: {
                                                Region_name: recordsConso.fields.region,
                                                Region_code: recordsConso.fields.code_insee_region,
                                                Region_wealth: resultConso.budgetParHabitant
                                            },
                                            Temperature: {
                                                Temperature_moyenne: recordsTemp.fields.tmoy,
                                                Temperature_minimale: recordsTemp.fields.tmin,
                                                Temperature_maximale: recordsTemp.fields.tmax
                                            },
                                            Consommation_energetique: {
                                                Conso_elec: recordsConso.fields.consommation_brute_electricite_rte,
                                                Conso_gaz: recordsConso.fields.consommation_brute_gaz_totale,
                                            }
                                        })
                                    }
                                })
                            })

                            resultConso.Mesure = conso;

                            if (format === "application/json") {
                                res.json(resultConso);
                            } else if (format === "application/xml") {
                                res.send(js2xmlparser.parse("regions", resultConso));
                            } else if (format === "application/rdf+xml") {
                                let xml_rdf = `<?xml version="1.0"?>\n`
                                xml_rdf += `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns"
                            xmlns:sql="http://ns.inria.fr/ast/%22%3E"
                            xmlns:oml = "http://def.seegrid.csiro.au/ontology/om/om-lite"
                            xmlns:lsweb = "http://ontology.cybershare.utep.edu/ELSEWeb/elseweb-data.owl"
                            xmlns:dc = "http://purl.org/dc/elements/1.1/"
                            xmlns:igeo = "http://rdf.insee.fr/def/geo"
                            xmlns:place = "http://purl.org/ontology/places"
                            xmlns:s4bldg  = "https://saref.etsi.org/saref4bldg/"
                            xmlns:s4wear = "https://saref.etsi.org/saref4wear/"
                            xmlns:ddesc= "https://w3id.org/arco/ontology/denotative-description/"
                            xmlns:shw = "http://paul.staroch.name.thesis/SmartHomeWeather.owl"
                            xmlns:owl = "http://www.w3.org/2002/07/owl"
                            xmlns:frapo = "http://purl.org/cerif/frapo">\n`

                                recordsConso.forEach(function (recordsConso) {
                                    recordsTemp.forEach(function (recordsTemp) {
                                        if (recordsTemp.fields.date === recordsConso.fields.date) {
                                            xml_rdf += `\t<oml:MeasureObject>\n`
                                            xml_rdf += `\t\t<dc:Publisher rdf:property = "http://purl.org/dc/elements/1.1/publisher">\n`
                                            xml_rdf += `\t\t\t<dc:Agent rdf:about="https://opendata.reseaux-energies.fr/api/records/1.0/search/"/>\n`
                                            xml_rdf += `\t\t</dc:Publisher>\n`
                                            xml_rdf += `\t\t<lsweb:hasDate>` + recordsConso.fields.date + `</lsweb:hasDate>\n`
                                            xml_rdf += `\t\t<s4wear:isLocated>\n`
                                            xml_rdf += `\t\t\t<dc:Location>\n`
                                            xml_rdf += `\t\t\t\t<igeo:codeRegion rdf:datatype = "http://www.w3.org/2001/XMLSchema#int">` + recordsConso.fields.code_insee_region + `</igeo:codeRegion>\n`
                                            xml_rdf += `\t\t\t\t<place:Region rdf:datatype = "http://www.w3.org/2001/XMLSchema#string">` + recordsConso.fields.region + `</place:Region>\n`
                                            xml_rdf += `\t\t\t\t<owl:hasValue>\n`
                                            xml_rdf += `\t\t\t\t\t<frapo:Budjet rdf:datatype = "http://www.w3.org/2001/XMLSchema#int">` + resultConso.budgetParHabitant + `</frapo:Budjet>\n`
                                            xml_rdf += `\t\t\t\t</owl:hasValue>\n`
                                            xml_rdf += `\t\t\t</dc:Location>\n`
                                            xml_rdf += `\t\t</s4wear:isLocated>\n`
                                            xml_rdf += `\t\t<ddesc:hasMeasurement>\n`
                                            xml_rdf += `\t\t\t<s4bldg:nominalPowerConsumption rdf:datatype = "http://www.w3.org/2001/XMLSchema#int">` + recordsConso.fields.consommation_brute_electricite_rte + `</s4bldg:nominalPowerConsumption>\n`
                                            xml_rdf += `\t\t</ddesc:hasMeasurement>\n`
                                            xml_rdf += `\t\t<shw:hasTemperatureValue>\n`
                                            xml_rdf += `\t\t\t<shw:Temperature>\n`
                                            xml_rdf += `\t\t\t\t<sql:avg rdf:datatype = "http://www.w3.org/2001/XMLSchema#float" >` + recordsTemp.fields.tmoy + `</sql:avg>\n`
                                            xml_rdf += `\t\t\t\t<sql:min rdf:datatype = "http://www.w3.org/2001/XMLSchema#float" >` + recordsTemp.fields.tmin + `</sql:min>\n`
                                            xml_rdf += `\t\t\t\t<sql:max rdf:datatype = "http://www.w3.org/2001/XMLSchema#float" >` + recordsTemp.fields.tmax + `</sql:max>\n`
                                            xml_rdf += `\t\t\t</shw:Temperature>\n`
                                            xml_rdf += `\t\t</shw:hasTemperatureValue>\n`
                                            xml_rdf += `\t</oml:MeasureObject>\n`

                                        }
                                    })
                                })
                                xml_rdf += `</rdf:RDF>`
                                res.send(xml_rdf);
                            }
                        })
                })
        });
}


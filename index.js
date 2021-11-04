"use strict";

const express = require('express');
const js2xmlparser = require("js2xmlparser");
const app = express();
const PORT = process.env.PORT || 3000 ;
//var Promise = require(promise)



var fetchUrl = require("fetch").fetchUrl
  app.get('/conso/:region',  function (req, res) {
    const region_param = req.params.region;
    let date_var =  req.query.date
    console.log(region_param);
    const url_conso = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=consommation-quotidienne-brute-regionale&q=&rows=1000&sort=date_heure&facet=date_heure&facet=code_insee_region&facet=region&facet=consommation_brute_electricite_rte&refine.code_insee_region=${region_param}&refine.date=${date_var}`

    fetchUrl(url_conso,
      function(error, meta, body ){
        const parsed =  JSON.parse(body);
        //const fields = parsed.records[0].fields.code_insee_region;
        const records_conso =  parsed.records;

        const url_temp = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=temperature-quotidienne-regionale&q=&rows=1000&sort=-date&facet=date&facet=region&refine.code_insee_region=${region_param}&refine.date=${date_var}`

        fetchUrl(url_temp,
          function(error2, meta2, body2 ){
            const parsed2 = JSON.parse(body2);
            //let fields2 = parsed2.records[0].fields.date;
            const records_temp = parsed2.records;
            //res.json(parsed2);
            const data = {
              conso : records_conso,
              temp: records_temp
            };
            let result_conso = {}; //json qu'on va remplir
            result_conso.Region = region_param;
            result_conso.Periode = date_var;
            let conso = []
            records_conso.forEach(function(records_conso){
              records_temp.forEach(function(records_temp){
                if (records_temp.fields.date == records_conso.fields.date){
                  conso.push( {Date_mesure : records_conso.fields.date,
                              Conso_rte : records_conso.fields.consommation_brute_electricite_rte,
                              Region : records_conso.fields.region,
                              Temperature : records_temp.fields.tmoy
                            })
                          }
                        })
              })
                //else{console.log("Oh no")}
            result_conso.Features = conso;

            // function converter(file, format) {
            //   var finalfile = file;
            //   if format=="xml":
            //     finalfile = js2xmlparser.parse("person", obj);
            //   return finalfile;
            //   if format=="rdf":
            //
            // }

            res.json(result_conso);
            //console.log(js2xmlparser.parse("Bloupi", result_conso));
          })
          //res.json(parsed);
          //console.log(fields)
      });

   //res.send('Bienvenue sur petits emprunts bientôt en react !')
});


app.listen(PORT, function () {
  console.log('Petits emprunts lancé sur le port :' + PORT);
});

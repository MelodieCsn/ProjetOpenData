"use strict";

const express = require('express');
const js2xmlparser = require("js2xmlparser");
const app = express();
const PORT = process.env.PORT || 3000 ;




var fetchUrl = require("fetch").fetchUrl
  app.get('/conso/:region',  function (req, res) {
    const region_param = req.params.region;
    let date_var =  req.query.date
    console.log(region_param);
    const url_conso = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=consommation-quotidienne-brute-regionale&q=&rows=1000&sort=date_heure&facet=date_heure&facet=code_insee_region&facet=region&facet=consommation_brute_electricite_rte&refine.code_insee_region=${region_param}&refine.date=${date_var}`

    fetchUrl(url_conso,
      function(error, meta, body ){
        const parsed =  JSON.parse(body);

        const records_conso =  parsed.records;

        const url_temp = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=temperature-quotidienne-regionale&q=&rows=1000&sort=-date&facet=date&facet=region&refine.code_insee_region=${region_param}&refine.date=${date_var}`

        fetchUrl(url_temp,
          function(error2, meta2, body2 ){
            const parsed2 = JSON.parse(body2);

            const records_temp = parsed2.records;

            const data = {
              conso : records_conso,
              temp: records_temp
            };
            let result_conso = {}; //json qu'on va remplir
            result_conso.Publisher = "Open Data Réseaux Energies"
            result_conso.Region = region_param;
            result_conso.Periode = date_var;
            let conso = []
            records_conso.forEach(function(records_conso){
              records_temp.forEach(function(records_temp){
                if (records_temp.fields.date == records_conso.fields.date){
                  conso.push( {Date_mesure : records_conso.fields.date,
                              Region :{
                                  Region_name : records_conso.fields.region,
                                  Region_code : records_conso.fields.code_insee_region},
                                  Temperature : {
                                        Temperature_moyenne : records_temp.fields.tmoy,
                                        Temperature_minimale : records_temp.fields.tmin,
                                        Temperature_maximale : records_temp.fields.tmax
                                      },
                                      Consommation_energetique : {
                                        Conso_elec : records_conso.fields.consommation_brute_electricite_rte,
                                        Conso_gaz : records_conso.fields.consommation_brute_gaz_totale,
                                      }
                                    }
                            )
                          }
                        })
              })
              result_conso.Mesure = conso;

              var xml_rdf =  `<?xml version="1.0"?>\n`
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
                      xmlns:shw = "http://paul.staroch.name.thesis/SmartHomeWeather.owl">\n`

              records_conso.forEach(function(records_conso){
                records_temp.forEach(function(records_temp){
                  if (records_temp.fields.date == records_conso.fields.date){
                    xml_rdf += `\t<oml:MeasureObject>\n`
                    xml_rdf += `\t\t<dc:Publisher rdf:property = "http://purl.org/dc/elements/1.1/publisher">\n`
                    xml_rdf += `\t\t\t<dc:Agent rdf:about="https://opendata.reseaux-energies.fr/api/records/1.0/search/"/>\n`
                    xml_rdf += `\t\t</dc:Publisher>\n`
                    xml_rdf += `\t\t<lsweb:hasDate>` + records_conso.fields.date + `</lsweb:hasDate>\n`
                    xml_rdf += `\t\t<s4wear:isLocated>\n`
                    xml_rdf += `\t\t\t<dc:Location>\n`
                    xml_rdf += `\t\t\t\t<igeo:codeRegion rdf:datatype = "http://www.w3.org/2001/XMLSchema#int">` + records_conso.fields.code_insee_region + `</igeo:codeRegion>\n`
                    xml_rdf += `\t\t\t\t<place:Region rdf:datatype = "http://www.w3.org/2001/XMLSchema#string">` + records_conso.fields.region + `</place:Region>\n`
                    xml_rdf += `\t\t\t</dc:Location>\n`
                    xml_rdf += `\t\t</s4wear:isLocated>\n`
                    xml_rdf += `\t\t<ddesc:hasMeasurement>\n`
                    xml_rdf += `\t\t\t<s4bldg:nominalPowerConsumption rdf:datatype = "http://www.w3.org/2001/XMLSchema#int">` + records_conso.fields.consommation_brute_electricite_rte + `</s4bldg:nominalPowerConsumption>\n`
                    xml_rdf += `\t\t</ddesc:hasMeasurement>\n`
                    xml_rdf += `\t\t<shw:hasTemperatureValue>\n`
                    xml_rdf += `\t\t\t<shw:Temperature>\n`
                    xml_rdf += `\t\t\t\t<sql:avg rdf:datatype = "http://www.w3.org/2001/XMLSchema#float" >` + records_temp.fields.tmoy + `</sql:avg>\n`
                    xml_rdf += `\t\t\t\t<sql:min rdf:datatype = "http://www.w3.org/2001/XMLSchema#float" >` + records_temp.fields.tmin + `</sql:min>\n`
                    xml_rdf += `\t\t\t\t<sql:max rdf:datatype = "http://www.w3.org/2001/XMLSchema#float" >` + records_temp.fields.tmax + `</sql:max>\n`
                    xml_rdf += `\t\t\t</shw:Temperature>\n`
                    xml_rdf += `\t\t</shw:hasTemperatureValue>\n`
                    xml_rdf += `\t</oml:MeasureObject>\n`

                  }
                })
              })
                xml_rdf += `</rdf:RDF>`


            res.json(result_conso);
            let result_xml = js2xmlparser.parse("Consommation_elec_temperature_par_region", result_conso);
            console.log(xml_rdf);
          })

      });

});


app.listen(PORT, function () {
  console.log('Petits emprunts lancé sur le port :' + PORT);
});

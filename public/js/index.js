var MongoClient = require("mongodb").MongoClient;
var url = 'mongodb://user:user@devincimdb1034.westeurope.cloudapp.azure.com:30000/employeesDB';
MongoClient.connect(url, function (err, client) {
  if (err) throw err;

  var db = client.db('employeesDB');
  var codeCompagnie = 0;
  var resultat;
  opMatch = {$match:{"emp_no": 24637}};
  opUnwind = {$unwind: "$titles"}; // coupe le tableau
  opProject = {$project: {"titles.title":1}};
  var employee;
  //Requete sur la table Airline_ID pour récupérer le code de la compagnie American Airlines
  db.collection('employees').aggregate([opMatch, opUnwind, opProject]).toArray(function (findErr, result) {
    if (findErr) throw findErr;
    employee = result[0];
    console.log( employee.titles.title );
    var div = document.getElementById('positions');

    div.innerHTML += 'Extra stuff';
    //Requete sur la table principale pour récupérer la totalité des vols réalisés par American Airlines en 2016 au premier semestre
  });
});

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  var db = req.db;
  var collection = db.get('employees');
  var userName = 10009;
  if(req.body.username)
  {
    userName = req.body.username;
  }

  opMatch = {$match:{"emp_no": userName}};
  opUnwind = {$unwind: "$titles"}; // coupe le tableau
  opProject = {$project: {"titles.title":1}};

  var employee = await collection.aggregate([opMatch, opUnwind, opProject],function (findErr, result) {
    if (findErr) throw findErr;
    //employee = result;
    console.log( employee );
    return result
  });

  opMatch2 = {$match: {"gender": "F"}};
  opGroup = {$group: {"_id": null, "res": {$sum:1}}}; // pour tout grouper
   var number = await collection.aggregate([opMatch2, opGroup],function (findErr, result) {
    if (findErr) throw findErr;
    //number = result;
    console.log( number );
    return result
  });


  mapFunction = function () {

    for(var i=0;i<this.dept_emp.length;i++){
      dep = this.dept_emp[i];
      if (dep.to_date == "9999-01-01")
      {
          dep_name = dep.dept.dept_name
      }
      annee = (this.hire_date).substring(0,4);
      annees = {};
      for(var i =0; i<this.salaries.length; i++){
          if (this.salaries[i].to_date == "9999-01-01")
          {
              nb = this.salaries[i].salary
          }
          else nb = null
      }
      annees[annee] = { "avg" : nb, "total" : 1};
      if(nb && nb>0) emit(dep_name, annees);
    }
  };
  reduceFunction = function (key, values) {
    annees = {};
    for(i=0 ; i< values.length ; i++){
      v = values[i];
      for(key in v){
          key_name = Object.keys(key)[0];
          nb = v[key].avg;
          if(key_name in annees)
          {
              nb2 = annees[key_name].avg;
              annees[key_name].avg = nb2 + nb;
              annees[key_name].total++;
          }
          else
          {
              annees[key_name] = { "avg" : v[key].avg, "total" : 1};
          }
      }
    }
    for(key in annees){
      annees[key].avg = annees[key].avg/annees[key].total;
    }

    return annees;
  };
  queryParam = {"query":{}, "out":{"inline" : 1}};
  var salaries = await collection.mapReduce(
    mapFunction,
    reduceFunction,
    queryParam,
    function (err, result) {
        //salaries=result;
        if (result) {
          console.log(result[0]['_id']);
          return result;
        }
    });

    mapFunction2 = function () {
      for(var i=0;i<this.dept_emp.length;i++){
        dep = this.dept_emp[i];
        if (dep.to_date == "9999-01-01")
        {
            dep_name = dep.dept.dept_name
        }
        if(this.gender == "F"){ emit(dep_name, {"total": 1, "F": 1}); }
        else{ emit(dep_name, {"total": 1, "F": 0});}

      }
    };
    reduceFunction2 = function (key, values) {
      nbF = 0;
      for(i=0 ; i< values.length ; i++){
          if(values[i].F == 1){
              nbF++;
          }
       }
       return (nbF/values.length)*100;
    };
    var percentage = await collection.mapReduce(
      mapFunction2,
      reduceFunction2,
      queryParam,
      function (err, result) {
          //salaries=result;
          if (result) {
            console.log(result);
            return result;
          }
      });
    res.render('index', {
        "userlist" : employee,
        "numberF" : number,
        "salary" : salaries,
        "percent":percentage
    });


});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});
module.exports = router;

'use strict';
var svm = require("svm");
var fs = require('fs'),
   fileName = 'bowData.json';

startClassify(fileName);

function startClassify (fileName){
   fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      var data = JSON.parse(data),
         testdata = [];

      for (var i = 0; i < 5; i++) {
         testdata.push(data[0].shift())
         testdata.push(data[1].shift())
      }
      var trueArray = data[0].map(function() {return 1}),
      falseArray = data[0].map(function() {return -1}),
      labels = trueArray.concat(falseArray);
      var classifiersData = data[0].concat(data[1]);
      classifiers(classifiersData, labels, testdata);
      // console.log(falseArray);
   });
}

function classifiers(data, labels, testdata){
   var SVM = new svm.SVM();
   console.log(data[0]);
   console.log(data.length);
   console.log(labels[0]);
   console.log(labels.length);
   SVM.train(data, labels);
   // тестируем
   var testlabels = SVM.predict(testdata);
   console.log(testlabels);
}

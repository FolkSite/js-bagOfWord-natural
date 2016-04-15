'use strict';

var fs = require('fs'),
   fileName = 'silver.json';

startClassify(fileName);

function startClassify (fileName){
   fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      var data = JSON.parse(data);
      classifiers(data);
   });
}

function classifiers(data){
   var natural = require('natural'),
      porterStemmer = natural.PorterStemmerRu,
      classifier = new natural.BayesClassifier(porterStemmer),
      dataLength = data[0].length,
      testLength = 50,
      trainLength = dataLength - testLength,
      badData = data[1],
      goodData = data[0];

   // Даем classifier'у примеры хороших и плохих данных.
   for (var i = 0; i < trainLength; i++) {
      classifier.addDocument(badData[i], '0');
      classifier.addDocument(goodData[i], '1');
   }

   var start = new Date();
   // Запускаем обучение на переданных текстах.
   classifier.train();
   var perfomanceTime = (start - new Date())/1000;

   var goodResult = [],
      badResult = [];

   // А теперь классифицируем тестовые тексты.
   console.log('Test');

   for (var i = 0; i < testLength; i++) {
      goodResult.push(classifier.classify(goodData[dataLength-(i+1)]));
      badResult.push(classifier.classify(badData[dataLength-(i+1)]));
   }

   var positive = goodResult.reduce(function(sum, item){
      if(item === '0') return sum+1;
      else return sum;
   }, 0);

   var negative = badResult.reduce(function(sum, item){
      if(item === '1') return sum+1;
      else return sum;
   }, 0);

   console.log(goodResult);
   console.log(badResult);

   console.log('Время '+ perfomanceTime + " sec");
   console.log('Угадал хороших ' + positive + 'из ' + testLength);
   console.log('Угадал плохих ' + negative + 'из ' + testLength);

}

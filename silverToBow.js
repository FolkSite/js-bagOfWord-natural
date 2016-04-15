'use strict';

var mimir = require('mimir'),
   bow = mimir.bow,
   dict = mimir.dict,
   texts = [],
   fs = require('fs'),
   fileName = 'silver.json',
   resultFileName = 'bowData.json';

startClassify(fileName);

function startClassify (fileName){
   fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      var data = JSON.parse(data);
      word2bow(data);
   });
}

function word2bow(data){
   data.forEach(function(set){
      set.forEach(function(item){
         texts.push(item)
      })
   });

   var voc = dict(texts),
      result = data.map(function (set) {
         return set.map(function (item) {
            return bow(item, voc);
         })
      });

   result = JSON.stringify(result);

   writeResult(resultFileName, result)

}

/*
 * Пишет необходимые данные в файл.
 * @param {String} fileName - имя файла.
 * @param {String} data - тело файла.
 *
 * @return
 */
function writeResult (fileName, data){
   fs.writeFile(fileName, data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });
}
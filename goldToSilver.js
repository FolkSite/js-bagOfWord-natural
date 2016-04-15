/**
 * Created by dmitry on 15.04.16.
 */

var fs = require('fs'),
   fileName = 'gold.json',
   editFileName = 'silver.json';

toSilver(fileName, editFileName);

function toSilver (fileName, editFileName){
   fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
         return console.log(err);
      }
      var data = JSON.parse(data);
      //вставляем в массив только текст, причем убираем все непристойные символы
      var silver = data.map(function (set) {
         return set.map(function (item) {
            return item
               .review
               .reviewDescription
               .replace(/(?:\\[rn]|[\r\n]+)+/g, "")
         })
      });

      silver = JSON.stringify(silver);

      fs.writeFile(editFileName, silver, function(err){
         if (err) throw err;
         console.log('It\'s saved!');
      });
   });
}
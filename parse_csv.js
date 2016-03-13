var fs = require('fs');

var getMnistData = function(content) {
   var lines = content.toString().split('\n');

   var data = [];
   for (var i = 0; i < lines.length; i++) {
      var input = lines[i].split(',').map(Number);

      var output = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);
      output[input.shift()] = 1;

      data.push({
         input: input,
         output: output
      });
   }

   return data;
};


fs.readFile(__dirname + '\\data\\mnist_test.csv', function (err, trainContent) {
   if (err) {
      console.log('Error:', err);
   }
   var data = JSON.stringify(getMnistData(trainContent));
   fs.writeFile('cnjs_example\\data.json', data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });

});

fs.readFile(__dirname + '\\data\\mnist_train.csv', function (err, trainContent) {
   if (err) {
      console.log('Error:', err);
   }
   var data = JSON.stringify(getMnistData(trainContent));
   fs.writeFile('cnjs_example\\test.json', data, function(err){
      if (err) throw err;
      console.log('It\'s saved!');
   });

});

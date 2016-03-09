var fs = require('fs');
var brain = require("brain");
console.log(__dirname);
var path = __dirname
   .split('/')
   .slice(0, -1)
   .concat('mnist_in_csv', 'mnist_test.csv')
   .join('/');

// Импорт данных
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



fs.readFile(__dirname + '/mnist_test.csv', function (err, trainContent) {
   if (err) {
      console.log('Error:', err);
   }

   var data = getMnistData(trainContent);
   //console.log(Array.isArray(data));
   var trainData = data.slice(0, 1000);
   var validationData = data.slice(1001, 1010);
   var net = new brain.NeuralNetwork({hiddenLayers: [784, 392, 196]});
   net.train(trainData, {
      errorThresh: 0.025,
      log: true,
      logPeriod: 1,
      learningRate: 0.1
   });

   for (var k=0; k<validationData.length; k++) {
      var realOut = net.run(validationData[k].input);
      console.log(validationData[k].output);
      console.log('real ' + realOut);
   }

});



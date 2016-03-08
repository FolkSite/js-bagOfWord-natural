var fs = require('fs');
var convnetjs = require("convnetjs");
var path = __dirname
   .split('/')
   .slice(0, -1)
   .concat('mnist_in_csv', 'mnist_test.csv')
   .join('/');

// Создаем сеть и учителя
var layer_defs = [];
layer_defs.push({type:'input', out_sx:24, out_sy:24, out_depth:1});
layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:3, stride:3});
layer_defs.push({type:'softmax', num_classes:10});
var net = new convnetjs.Net();
net.makeLayers(layer_defs);
var trainer = new convnetjs.SGDTrainer(net, {method:'adadelta', batch_size:10, l2_decay:0.001});


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



fs.readFile(path, function (err, trainContent) {
   if (err) {
      console.log('Error:', err);
   }

   var data = getMnistData(trainContent);
   //console.log(Array.isArray(data));
   var trainData = data.slice(0, 1000);
   var validationData = data.slice(1001, 1010);

   for (var i=0; i<trainData.length; i++) {
      var x = new convnetjs.Vol(28,28,1,0.0); // a 1x1x2 volume initialized to
      // 0's.
      for (var j=0; j<trainData[i].input; j++) {
         x.w[j] = trainData[i].input[j]; // Vol.w is just a list, it holds
         // your data
      }

      trainer.train(x, trainData[i].output);
   }
   console.log(trainData[i-2].output);

   //console.log(validationData.length);
   for (var k=0; k<validationData.length; k++) {
      x = new convnetjs.Vol(28,28,1,0.0);
      for (var n=0; n<validationData[k].input; n++) {
         x.w[n] = validationData[k].input[n];
      }
      var realOut = validationData[k].output;
      var out = net.forward(x);
      //console.log(out.w);
      //console.log(out.w + ' real ' + realOut)
      console.log(out.w);
      console.log('real ' + realOut);
   }

});



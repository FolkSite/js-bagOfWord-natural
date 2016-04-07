
// Создаем сеть и учителя
var layer_defs = [];
layer_defs.push({type:'input', out_sx:24, out_sy:24, out_depth:1});
layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:3, stride:3});
layer_defs.push({type:'softmax', num_classes:10});

net = new convnetjs.Net();
net.makeLayers(layer_defs);

trainer = new convnetjs.SGDTrainer(net, {method:'adadelta', batch_size:20, l2_decay:0.001});


var train = function(){
   xhttp = new XMLHttpRequest();
   xhttp.open('GET', './../data/data.json', true);
   xhttp.send();
   xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
         var data = JSON.parse(xhttp.responseText);
         console.log('Тренируем');
         var trainData = data.slice(0, 60000);

         for (var i=0; i<trainData.length; i++) {
            var x = new convnetjs.Vol(28,28,1,0.0);
            for (var j=0; j<trainData[i].input.length; j++) {
               x.w[j] = trainData[i].input[j];
            }
            x = convnetjs.augment(x, 24);
            trainer.train(x, trainData[i].output);
         }
         console.log('Тренировка окончена');
         test();
      }
   }
};

var test = function () {
   xhttp = new XMLHttpRequest();
   xhttp.open('GET', './../data/data.json', true);
   xhttp.send();
   xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
         var data = JSON.parse(xhttp.responseText).slice(0, 10000);
         console.log('тестируем');
         var trueCount = 0;
         for (var i=0; i < data.length; i++) {
            x = new convnetjs.Vol(28,28,1,0.0);
            for (var j=0; j < data[i].input.length; j++) {
               x.w[i] = data[i].input[j];
            }
            x = convnetjs.augment(x, 24);
            var realOut = data[i].output;
            var out = net.forward(x);
            if (out.w.indexOf(1) === realOut.indexOf(1)){
               trueCount++;
            }
         }
         console.log(trueCount);
      }
   }
};

train();



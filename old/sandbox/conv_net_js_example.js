var convnetjs = require("convnetjs");

var layer_defs = [];
// minimal network: a simple binary SVM classifer in 2-dimensional space
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:2});
layer_defs.push({type:'svm', num_classes:2});

// create a net
var net = new convnetjs.Net();
net.makeLayers(layer_defs);

// create a 1x1x2 volume of input activations:
var x = new convnetjs.Vol(1,1,2);
x.w[0] = 0.5; // w is the field holding the actual data
x.w[1] = -1.3;
// a shortcut for the above is var x = new convnetjs.Vol([0.5, -1.3]);

var scores = net.forward(x); // pass forward through network
// scores is now a Vol() of output activations
console.log('score for class 0 is assigned:'  + scores.w[0]);
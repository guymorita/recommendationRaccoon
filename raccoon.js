exports.raccoon = function(urlOfDB){

  var models = require('./sampleContent/starter.js').starter(urlOfDB),
    algo = require('./algorithms.js');
    input = require('./input.js').input();
    stat = require('./stat.js').stat();

  return {
    models: models,
    input: input,
    stat: stat
  };
};


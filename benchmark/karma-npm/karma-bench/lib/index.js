var path = require('path');

function createPattern(pattern) {
  return {
    pattern: pattern,
    included: true,
    served: true,
    watched: false
  }
}

function initBench(files) {
  files.unshift(createPattern(path.join(__dirname, 'adapter.js')))
}

initBench.$inject = ['config.files', 'config.client.bench'];

module.exports = {
  'framework:bench': ['factory', initBench]
};

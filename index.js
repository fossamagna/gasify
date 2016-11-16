var through = require('through2');
var gasEntryGenerator = require('gas-entry-generator');

module.exports = function (b, opts) {
  var cache = {};
  var stubsCache = {};

  b.on('reset', collect);
  collect();

  function collect() {
    cache = {};
    b.pipeline.get('deps').push(through.obj(function (row, enc, next) {
      var file = row.expose ? b._expose[row.id] : row.file;
      cache[file] = {
        source: row.source
      };
      this.push(row);
      next();
    }));
  }

  b.on('transform', function (tr, mfile) {
    tr.on('file', function (dep) {
      invalidate(mfile);
    });
  });

  b.on('update', function (files) {
    files.forEach(function (file) {
      invalidate(file);
    });
  });

  function invalidate(file) {
    delete stubsCache[file];
  }

  function generateEntryPoint() {
    var entrypoints = '';
    for (var file in cache) {
      if ({}.hasOwnProperty.call(cache, file)) {
        var stub = stubsCache[file];
        if (!stub) {
          stub = gasEntryGenerator(cache[file].source);
          stubsCache[file] = stub;
        }
        entrypoints += stub;
      }
    }
    return 'var global = this;' + entrypoints;
  }

  var createStream = function () {
    var firstChunk = true;
    var stream = through.obj(function (buf, enc, next) {
      if (firstChunk) {
        this.push(new Buffer(generateEntryPoint()));
        firstChunk = false;
      }
      this.push(buf);
      next();
    });
    stream.label = 'gasentrypoint';
    return stream;
  };

  function setupPipeline() {
    b.pipeline.get('wrap').push(createStream());
  }

  setupPipeline();

  b.on('reset', function () {
    setupPipeline();
  });
};

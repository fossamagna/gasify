'use strict';

const through = require('through2');
const gasEntryGenerator = require('gas-entry-generator');

module.exports = function (b, opts) {
  let cache = {};
  const stubsCache = {};
  opts = Object.assign({comment: true}, opts);

  b.on('reset', collect);
  collect();

  function collect() {
    cache = {};
    b.pipeline.get('syntax').push(through.obj(function (row, enc, next) {
      const file = row.expose ? b._expose[row.id] : row.file;
      cache[file] = {
        source: row.source
      };
      this.push(row);
      next();
    }));
  }

  b.on('transform', (tr, mfile) => {
    tr.on('file', dep => {
      invalidate(mfile);
    });
  });

  b.on('update', files => {
    files.forEach(file => {
      invalidate(file);
    });
  });

  function invalidate(file) {
    delete stubsCache[file];
  }

  function generateEntryPoint() {
    let entrypoints = '';
    for (const file in cache) {
      if ({}.hasOwnProperty.call(cache, file)) {
        let stub = stubsCache[file];
        if (!stub) {
          stub = gasEntryGenerator(cache[file].source, opts);
          stubsCache[file] = stub;
        }
        entrypoints += stub;
      }
    }
    return 'var global = this;\n' + entrypoints;
  }

  const createStream = function () {
    let firstChunk = true;
    const stream = through.obj(function (buf, enc, next) {
      if (firstChunk) {
        this.push(Buffer.from(generateEntryPoint()));
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

  b.on('reset', () => {
    setupPipeline();
  });
};

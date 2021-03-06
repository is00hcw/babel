import stripJsonComments from "strip-json-comments";
import merge from "lodash/object/merge";
import path from "path";
import fs from "fs";

var cache = {};
var jsons = {};

function exists(filename) {
  if (!fs.existsSync) return false;

  var cached = cache[filename];
  if (cached != null) return cached;
  return cache[filename] = fs.existsSync(filename);
}

export default function (loc, opts = {}) {
  var rel = ".babelrc";

  function find(start, rel) {
    var file = path.join(start, rel);

    if (exists(file)) {
      var content = fs.readFileSync(file, "utf8");
      var json;

      try {
        json = jsons[content] ||= JSON.parse(stripJsonComments(content));
      } catch (err) {
        err.message = `${file}: ${err.message}`;
        throw err;
      }

      if (json.breakConfig) return;
      merge(opts, json, function(a, b) {
        if (Array.isArray(a)) {
          return a.concat(b);
        }
      });
    }

    var up = path.dirname(start);
    if (up !== start) { // root
      find(up, rel);
    }
  }
  
  if (opts.breakConfig !== true) {
    find(loc, rel);
  }
  

  return opts;
};

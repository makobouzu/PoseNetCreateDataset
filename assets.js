var express = require("express");
var fs = require("fs");

var router = express.Router();
var content = fs.readFileSync(".glitch-assets", "utf8");
var rows = content.split("\n");
var assets = rows.map(row => {
  try {
    return JSON.parse(row);
  } catch (e) {}
});
assets = assets.filter(asset => asset);

// Example url
// https://cdn.gomix.com/us-east-1%3A1a0f89c8-26bf-4073-baed-2b409695e959%2Ffoobar.png

router.use((request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (request.path == "/all") {
    var result = assets.filter(function(asset, index, array) {
      return (
        array.indexOf(asset) === index &&
        asset.name &&
        asset.url &&
        asset.url.indexOf("cdn.glitch.com") != -1
      );
    });
    var deleted = assets.filter(function(asset, index, array) {
      return asset.deleted;
    });
    var all_url = result.filter(function(asset, index, array) {
      let n = 0;
      for (let i = 0; i < deleted.length; i++) {
        if (deleted[i].uuid == asset.uuid) {
          n = 1;
        }
      }
      return n == 0;
    });
    let names = all_url.map(obj => obj.name);
    return response.send(names);
  } else {
    var path = request.path.substring(1).replace("u/", "");
    var [matching] = assets.filter(asset => {
      if (asset.name) {
        return asset.name.replace(/ /g, "%20") === path;
      }
    });

    if (!matching || !matching.url) {
      return response.status(404).end("No such file");
    }
    if (request.path.indexOf("/u/") == -1) {
      return response.redirect(matching.url);
    } else {
      return response.send([matching.url]);
    }
  }
});

module.exports = router;

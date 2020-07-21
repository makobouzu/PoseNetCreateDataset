// server.js
// where your node app starts

// init project
var express = require('express');
const cors = require('cors')
var app = express();
var assets = require('./assets');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors())

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use("/assets", assets);

// http://expressjs.com/en/startLSbasic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/img/all", function (request, response) {
  fs.readdir(__dirname + '/public/img', (err, files) => {
    response.send(files)
  });
})

app.get("/img/u/*", function (request, response) {
  response.send(["https://" + request.get('Host') + request.path.replace("/u", "")]);
})

// get json data
app.post('/data/dataset.json', function(req, res) {
  try {
    const data = JSON.stringify(req.body);
    fs.writeFileSync(__dirname +'/public/data/dataset.json', data);
    console.log("pose_length", req.body.imgInfo.length);
  } catch(e) {
    // Error handling
    console.log(e); // SyntaxError: Unexpected token o in JSON at position 1
  }
  res.send('success!');
});

app.get('/data/dataset.json', function(req, res) {
  const data = JSON.stringify(fs.readFileSync(__dirname +'/public/dataset.json'));
  console.log(data.length)
  res.json(fs.readFileSync(__dirname +'/public/dataset.json'));
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

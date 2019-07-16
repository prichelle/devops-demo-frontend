var express = require('express');
var bodyParser = require("body-parser");
var exphbs  = require('express-handlebars');
var app = express();
var os = require('os');
//var morgan  = require('morgan');
var http = require('http');
var request = require('sync-request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use("/css", express.static(__dirname + '/static/css'));
app.use("/images", express.static(__dirname + '/static/images'));
//app.use(express.static('static'));
//app.use(morgan('combined'));

// new vars in release v1.0
// Backend service URL
var backendHost = process.env.BACKEND_HOST || 'localhost';
var backendPort = process.env.BACKEND_PORT || '9080';

var userCheckURL = 'http://' + backendHost + ':' + backendPort + '/demo/api/user/v2/check';
var checkStatus;

// new function in release v1.0

app.post('/check', function (req, res) {
  var userName=req.body.user;
  var password=req.body.password;
  //console.log('User name = ' + userName + ' password is ' + password);
  var response = request('GET', userCheckURL + '?username=' + userName + '&password=' + password);
  var jsonRes = JSON.parse(response.getBody('utf8'));
  checkStatus = jsonRes['status'];
  /*
  http.get(userCheckURL + '?username=' + userName + '&password=' + password, function(res){
      var body = '';
      res.on('data', function(chunk){
        body += chunk;
      });
      res.on('end', function(){
        var jsonRes = JSON.parse(body);
        //user = jsonRes['username'];
        checkStatus = jsonRes['status'];
      });
  }).on('error', function(e){
      console.log("Got an error: ", e);
  });
  */
    //console.log('Check status: ' + checkStatus);
    res.redirect('/demo');
});
       
app.get('/demo', function (req, res) {
    res.render('home', {
      podName: process.env.POD_NAME || 'unknown',
      podNamespace: process.env.POD_NAMESPACE || 'unknown',
      podIP: process.env.POD_IP || 'unknown',
      podVersion: process.env.POD_VERSION || 'unknown',
      podEnv: process.env.POD_ENVIRONMENT || 'unknown',
      nodeArch: os.arch(),
      nodePlatform: os.type(),
      nodeRelease: os.release(),
      nodeHost: os.hostname(),
      //nodeUpTime: secToTime(os.uptime()),
      //user: user || '',
      checkStatus: checkStatus || 'unknown'
    });
});

// Set up listener
app.listen(8080, function () {
  console.log("Listening on: http://%s:%s", os.hostname(), 8080);
});

function secToTime(totalSeconds) {
  hours = Math.floor(totalSeconds / 60 / 60);
  totalSeconds %= 3600;
  minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;
  return ('0'+ hours).slice(-2) +'h:'+ ('0'+minutes).slice(-2) +'m:'+ ('0'+seconds).slice(-2) + 'sec' ;
}
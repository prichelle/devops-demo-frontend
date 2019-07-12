var express = require('express');
var bodyParser = require("body-parser");
var exphbs  = require('express-handlebars');
var app = express();
var os = require('os');
//var morgan  = require('morgan');
var http = require('http');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuration
var backendHost = process.env.BACKEND_HOST || 'localhost';
var backendPort = process.env.BACKEND_PORT || '9080';

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
//app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use("/css", express.static(__dirname + '/static/css'));
app.use("/images", express.static(__dirname + '/static/images'));
//app.use(express.static('static'));
//app.use(morgan('combined'));

var nodePropURL = 'http://' + backendHost + ':' + backendPort + '/demo/api/node/properties';
var nodeArch, nodePlatform, nodeRelease, nodeHost;
var podPropURL = 'http://' + backendHost + ':' + backendPort + '/demo/api/pod/properties';
var podName, podNamespace, podIP, podVersion, podEnv;

// new vars in release v1.0
var userCheckURL = 'http://' + backendHost + ':' + backendPort + '/demo/api/user/check';
var user, checkStatus;
       
app.get('/demo', function (req, res) {

     http.get(nodePropURL, function(res){
        var body = '';
        res.on('data', function(chunk){
            body += chunk;
        });
        res.on('end', function(){
            var jsonRes = JSON.parse(body);
            nodeArch = jsonRes['os.architecture'];
            nodePlatform = jsonRes['os.name'];
            nodeRelease = jsonRes['os.version'];
            nodeHost =  jsonRes['os.hostname'];
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
    
    
    http.get(podPropURL, function(res){
        var body = '';
        res.on('data', function(chunk){
            body += chunk;
        });
        res.on('end', function(){
            var jsonRes = JSON.parse(body);
            podName = jsonRes['pod.name'];
            podNamespace = jsonRes['pod.namespace'];
            podIP = jsonRes['pod.ip'];
            podVersion =  jsonRes['pod.version'];
            podEnv = jsonRes['pod.environment'];
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });

    res.render('home', {
      podName: podName || 'unknown',
      podNamespace: podNamespace || 'unknown',
      podIP: podIP || 'unknown',
      podVersion: podVersion || 'unknown',
      podEnv: podEnv || 'unknown',
      nodeArch: nodeArch || 'unknown',
      nodePlatform: nodePlatform || 'unknown',
      nodeRelease: nodeRelease || 'unknown',
      nodeHost: nodeHost || 'unknown',
      user: user || '',
      checkStatus: checkStatus || 'unknown'
    });
});

// new function in release v1.0

app.post('/check', function (req, res) {
  var userName=req.body.user;
  var password=req.body.password;
  console.log('User name = ' + userName + ' password is ' + password);
  
  http.get(userCheckURL + '?username=' + userName + '&password=' + password, function(res){
    var body = '';
    res.on('data', function(chunk){
        body += chunk;
    });
    res.on('end', function(){
        var jsonRes = JSON.parse(body);
        user = jsonRes['username'];
        checkStatus = jsonRes['status'];
    });
    }).on('error', function(e){
      console.log("Got an error: ", e);
    });

    res.redirect('/demo');
  });

// Set up listener
app.listen(8080, function () {
  console.log("Listening on: http://%s:%s", os.hostname(), 8080);
});
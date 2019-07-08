var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var os = require("os");
var morgan  = require('morgan');
var http = require('http');

// Configuration
var backendHost = process.env.BACKEND_HOST || "devops-demo-backend-internal";
var backendPort = process.env.BACKEND_PORT || "9080";

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('static'));
app.use(morgan('combined'));

var nodePropURL = 'http://' + backendHost + ':' + backendPort + '/demo/api/node/properties';
var nodeArch, nodePlatform, nodeRelease, nodeHost;

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

var podPropURL = 'http://' + backendHost + ':' + backendPort + '/demo/api/pod/properties';
var podName, podNamespace, podIP, podVersion, podEnv;

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

app.get('/demo', function (req, res) {
    res.render('home', {
      podName: podName || 'unknown',
      podNamespace: podNamespace || 'unknown',
      podIP: podIP || 'unknown',
      podVersion: podVersion || 'unknown',
      podEnv: podEnv || 'unknown',
      nodeArch: nodeArch || 'unknown',
      nodePlatform: nodePlatform || 'unknown',
      nodeRelease: nodeRelease || 'unknown',
      nodeHost: nodeHost || 'unknown'
    });
});

// Set up listener
app.listen(8080, function () {
  console.log("Listening on: http://%s:%s", os.hostname(), 8080);
});
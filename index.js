var app = require('express')();
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
var piblaster = require('pi-blaster.js')
var vm = require('vm')
var fs = require("fs")
var lastAction = "";
const PiCamera = require('pi-camera');

const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'mylogfile.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );
// running node server
server.listen(3000);

vm.runInThisContext(fs.readFileSync(__dirname + "/virtualjoystick.js/virtualjoystick.js"))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/joy.html');
});
app.use(express.static(__dirname + '/virtualjoystick.js'));

const myCamera = new PiCamera({
  mode: 'video',
  output: `${ __dirname }/video.h264`,
  width: 1920,
  height: 1080,
  timeout: 50000, // Record for 50 seconds
  nopreview: true,
  vflip: true,
  framerate: 10
});


function emergencyStop()
{
	//enter 0 point here specific to your pwm control
  	piblaster.setPwm(4, .05); //thr
 	piblaster.setPwm(18, .0); //spd
  	console.log('###EMERGENCY STOP - signal lost or shutting down');
} //END emergencyStop


io.sockets.on('connection', function(socket){
  console.log('a user connected');
  socket.on('fromclient', function (data){
         // steering
          var A = -170
          var B = 170
          var C = 0.070
	  var D = 0.13
	  var X = (data.x-A)/(B-A) * (D-C) + C
          // throttle
          var E = 0
	  var F = -200
	  var G = 0.202
	  var H = 0.206
	  var Y = (data.y-E)/(F-E) * (H-G) + G
          log.info("X:", X, "Y:", Y)
          piblaster.setPwm(4, X);
          piblaster.setPwm(18, Y)
	  myCamera.record()
  		.then((result) => {
    		    // Your video was captured
  		})
  		.catch((error) => {
     		    // Handle your error
  		});

  })

})

var app = require('express')();
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
var piblaster = require('pi-blaster.js')
var vm = require('vm')
var fs = require("fs")
var lastAction = "";

server.listen(3000);

vm.runInThisContext(fs.readFileSync(__dirname + "/virtualjoystick.js/virtualjoystick.js"))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/joy.html');
});
app.use(express.static(__dirname + '/virtualjoystick.js'));



function emergencyStop()
{
	//enter 0 point here specific to your pwm control
  	piblaster.setPwm(4, .05); //thr
 	piblaster.setPwm(18, .0); //spd
  	console.log('###EMERGENCY STOP - signal lost or shutting down');
}//END emergencyStop



io.sockets.on('connection', function(socket){
  console.log('a user connected');
  socket.on('fromclient', function (data){
         // steering
          var A = -170
          var B = 170
          var C = 0.075
	  var D = 0.13
	  var X = (data.x-A)/(B-A) * (D-C) + C

          var E = 0
	  var F = -300
	  var G = 0.202
	  var H = 0.206
	  var Y = (data.y-E)/(F-E) * (H-G) + G
          console.log(X, Y)
          piblaster.setPwm(4, X);
          piblaster.setPwm(18, Y)

  })

})

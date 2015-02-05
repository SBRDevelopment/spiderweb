// Dependencies
global.include = function(name) {
    return require(__dirname + '/' + name);
}

var express = require('express');
var http = require('http');
var routes = include('routes');
var bodyParser = require('body-parser')
var namespace = require('express-namespace')
var domain = require('connect-domain')
var config = include('config')
var state = include('state')
var zookeeper = include('zookeeper')

// Start express instance
var app = express();

// Set the default templating engine
app.engine('.html', state.ejs.__express)
app.set('view engine', 'html')

app.use(bodyParser.json());

// Set up routes
zookeeper.init(app, state)
routes.init(app, state)

app.use(domain())

app.use(function(err, req, res, next) {
	state.log.error(err)
	res.status(500)
	res.json({
		message: 'Unknown error occurred',
		error: err
	})
})

// Start the server
var server = http.createServer(app).listen(config.binding.port, function() {
	state.log.info('Express server listening on port ' + config.binding.port);
});
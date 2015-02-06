var zookeeper = require('node-zookeeper-client');
var ejs = require('ejs')
var config = include('config')
var log4js = require('log4js')

log4js.configure('log4js.config.json', {})
var log = log4js.getLogger('app')
log.setLevel(config.log.level)

module.exports = {
	config: config,
	ejs: ejs,
	log: log
}
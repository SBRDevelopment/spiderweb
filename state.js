var zookeeper = require('zookeeper');
var ejs = require('ejs')
var config = include('config')
var log4js = require('log4js')

log4js.configure('log4js.config.json', {})
var log = log4js.getLogger('app')
log.setLevel(config.log.level)

var zk = new zookeeper({
	connect: config.zookeeper.connect,
	timeout: 200000,
	debug_level: zookeeper.ZOO_LOG_LEVEL_WARN,
	host_order_deterministic: false
})

module.exports = {
	config: config,
	ejs: ejs,
	zk: zk,
	log: log
}
module.exports = {
	log: {
		level: process.env.LOG_LEVEL || 'DEBUG',
		config: process.env.LOG_CONFIG || 'log4js.config.json'
	},
	binding: {
		port: process.env.BINDING_PORT || 8081
	},
	api: {
		host: 'http://localhost:' + (process.env.BINDING_PORT || 8081)
	},
  	marathon: {
    	host: process.env.MARATHON_HOST || 'localhost',
    	port: process.env.MARATHON_PORT || 8080
	},
 	zookeeper: {
  		connect: process.env.ZOOKEEPER_CONNECT || 'localhost:2181'
  	}
}
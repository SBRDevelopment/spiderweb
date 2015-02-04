module.exports = {
	log: {
		level: process.env.log_level || 'DEBUG',
		config: process.env.log_config || 'log4js.config.json'
	},
	binding: {
		port: process.env.binding_port || 8081
	},
	api: {
		host: 'http://localhost:' + (process.env.binding_port || 8081)
	},
  	marathon: {
    	host: process.env.marathon_host || 'localhost',
    	port: process.env.marathon_port || 8080
	},
 	zookeeper: {
  		connect: process.env.zookeeper_connect || 'localhost:2181'
  	}
}
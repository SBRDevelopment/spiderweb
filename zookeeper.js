var fs = require('fs')
var zookeeper = require('node-zookeeper-client')
var async = require('async')
var config = include('config')

var getTemplatePath = function(appId) {
	return '/spiderweb/template/' + appId
}

var getAppsPath = function() {
	return '/spiderweb/apps'
}

var getSettingPath = function(appId, id) {
	return getAppsPath() + '/' + appId + '/.setting' + (id ? '/' + id : '')	
}

var getDefaultConfig = function(callback) {
	var path = require('path')
	fs.readFile(path.join(process.cwd(), 'views', 'haproxy.cfg'), 'utf8', function(err, data) {
		if(err) {
			callback('')
		} else {
			callback(data)
		}
	})
}

function Zookeeper() {
    if (!(this instanceof Zookeeper)) {
        return new Zookeeper();
    }
    this.client = zookeeper.createClient(config.zookeeper.connect, {
		sessionTimeout: 30000,
		spinDelay: 1000,
		retries: 3
	})
}

Zookeeper.prototype.exists = function(node, failure, success) {
	this.client.exists(node, function(err, stat) {
		    if (err) {
		        failure(error);
		        return;
		    }
		    if (stat) {
		        success()
		    } else {
		        failure(null)
		    }
		}
	)
}

Zookeeper.prototype.mkdir = function(node, failure, success) {
	this.client.mkdirp(node, function(err) {
		if(err) {
			failure(err)
		} else {
			success()
		}
	})
}

Zookeeper.prototype.set = function(node, content, failure, success) {
	this.client.getData(node, function(err, data, stat) {
			if(err) {
				if(err.getCode() == zookeeper.Exception.NO_NODE) {
					this.mkdir(node, failure, function() {
						this.set(node, content, failure, success)
					}.bind(this))
				} else {
					failure(err)
				}
			} else {
				this.client.setData(node, new Buffer(content), stat.version, function (err, stat)  {
					if(err) {
						failure(err)
						return;
					} 
					
					success(stat)
				})
			}
		}.bind(this)
	)
}

Zookeeper.prototype.get = function(node, failure, success) {
	this.client.getData(node, function(err, data, stat) {
			if(err) {
				failure(err)
				return;
			} 
			if(data) {
				success(data.toString('utf8'), stat)
			} else {
				success('', stat)
			}			
		}
	)
}

Zookeeper.prototype.get_children_paths = function(node, failure, success) {
	this.client.getChildren(node, function (err, children, stats) {
			if(err) {
				if(err.getCode() == zookeeper.Exception.NO_NODE) {
					this.mkdir(node, failure, function() {
						this.get_children_paths(node, failure, success)
					}.bind(this))
				} else {
					failure(err)
				}
			} else {
				success(children)
			}
		}.bind(this)
	)
}

Zookeeper.prototype.get_children = function(node, failure, success, eachitem) {
	this.get_children_paths(node, failure, function (children) {
			var items = []
			async.each(children, 
				function(child, callback) {
					var childPath = node + '/' + child
					this.get(childPath, callback, function(data, stat) {
						if(data) {
							items.push(eachitem(child, data, stat))	
						}
						callback()
					})
				}.bind(this),
				function(err) {
					if(err) {
						failure(err)
					} else {
						success(items)
					}
				}
			)
		}.bind(this)
	)
}

module.exports.createClient = function(){
	return new Zookeeper()
}

module.exports.getTemplatePath = getTemplatePath
module.exports.getSettingPath = getSettingPath
module.exports.getAppsPath = getAppsPath
module.exports.getDefaultConfig = getDefaultConfig
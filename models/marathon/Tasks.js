var Config = require('../../config')
var RestClient = require('node-rest-client').Client
var _ = require('underscore')
var Backbone = require('backbone')
Backbone.$ = require('jquery')

var TasksUri = 'http://' + Config.marathon.host + ':' + Config.marathon.port + '/v2/tasks'
var Task = Backbone.Model.extend({})
var Tasks = Backbone.Collection.extend({
	model: Task,
	url: TasksUri,
	parse: function(response) {
		var tasks = {}
		_.each(response.tasks, function(task) {
			if(task.ports) {
				_.each(task.servicePorts, function(port, idx) {
					var id = (task.appId + '_' + port.toString()).replace(/^\//, '').replace(/[^\w]/g, '_')
					if(!tasks.hasOwnProperty(id)) {
						tasks[id] = {
							id: id,
							port: port,
							appId: task.appId,		
							hosts: [],
							settings: {
								options: []
							}
						}
					}
					tasks[id].hosts.push({
						id: (task.host + '_' + task.ports[idx].toString()).replace(/^\//, '').replace(/[^\w]/g, '_'),
						host: task.host,
						port: task.ports[idx]
					})
				})
			}
		})
		return _.toArray(tasks)
	}
})

Tasks.getTasks = function(callback) {
	new RestClient().get(TasksUri, function(data, response) {
		callback(null, new Tasks().parse(data));	
	})
}

module.exports = Tasks;
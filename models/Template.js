var Config = require('../config')
var RestClient = require('node-rest-client').Client
var Backbone = require('backbone')
var _ = require('underscore')

Backbone.$ = require('jquery')

var TemplateUri = 'api/v1.0/template'
var Template = Backbone.Model.extend({
	url: TemplateUri,
	render: function(callback, ops) {
		var model = this
		var url = model.url + '/' + model.id + '/render'
		var options = {
			url: url,
			type: 'GET',
			dataType: 'json',
			success: callback
		}
		_.extend(options, ops)
		$.ajax(options)
	}
})

Template.getTemplate = function(id, callback) {
	new RestClient().get(Config.api.host + '/' + TemplateUri + '/' + id, function(data, response) {
		callback(null, data);	
	})
}

module.exports = Template;
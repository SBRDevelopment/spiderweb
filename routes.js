var fs = require('fs')
var path = require('path')
var express = require('express');

module.exports.init = function(app, state){

  var controllers = {}
  var controllers_path = path.join(__dirname, 'controllers')
  fs.readdirSync(controllers_path).forEach(function (file) {
      if (file.indexOf('.js') != -1) {
          controllers[file.split('.')[0]] = require(path.join(controllers_path, file))(app, state)
      }
  })

  app.namespace('/', function() {
    app.get('/', controllers.index.viewIndex)  
  })
  
  // Setup api routes
  app.namespace('/api/v1.0', function() {
    app.namespace('template', function() {
      app.get('/:appId', controllers.template.viewTemplate)
      app.get('/:appId/render', controllers.template.renderTemplate)
      app.get('/:appId/render.txt', controllers.template.renderTemplateText)
      app.put('/', controllers.template.updateTemplate)
    })
    app.namespace('setting', function() {
      app.get('/', controllers.setting.viewAllSettings)
      app.get('/:appId', controllers.setting.viewSettings)
      app.put('/:appId/:id', controllers.setting.updateSetting)
    })
  })

  // Setup static routes
  app.use(express.static(path.join(__dirname, 'public')))

}
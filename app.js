/** @jsx React.DOM */
var React = require('react')
var SpiderWebApp = require('./components/SpiderWebApp.react')

// Enable the YAML mode for codemirror
require('codemirror/mode/yaml/yaml')

// Snag the initial state that was passed from the server side
var initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

// Render the components, picking up where react left off on the server
React.renderComponent(
  <SpiderWebApp tasks={initialState.tasks} template={initialState.template} />,
  document.getElementById('spiderweb-app')
);
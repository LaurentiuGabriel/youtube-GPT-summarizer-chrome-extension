const {
  runtime,
  browserAction
} = require('chrome-extension-async');

browserAction.onClicked.addListener(() => {
  alert('Button clicked!');
});
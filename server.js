var express = require('express');
var path = require("path");
var app = express();

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/bower_components/serialijse', express.static(path.join(__dirname, 'bower_components/serialijse')));
app.listen(3000, function() {
    console.log('Listening on port 3000');
});

//Change the './' to point to the root of your angular app
app.use(express.static(path.resolve('./')));

//Send everything to your index.html page
app.get('/*', function(req, res) {
  res.sendFile(path.resolve('./index.html'));
 });
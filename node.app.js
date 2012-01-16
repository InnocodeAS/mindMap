var express = require('express');
var downloads = {};
var app = express.createServer(
    express.logger()
  , express.bodyParser()
);

app.configure(function(){
    app.use(app.router);
    app.use("/"   , express.static(__dirname + '/'));
});

app.listen(3001);
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var User = require('./app/models/user/user.model.js');
var router = require('./app/routes');

// Import sequelize models
var models = require('./app/models/sequelize.js');
app.set('models', models);

models.sequelize.sync().then(() => {
	console.log('Nice! Database looks fine')
}).catch((err) => {
	console.log(err, "Something went wrong with the Database Update!")
});

app.use(bodyParser.urlencoded({
	extended: false
})); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses

app.use(cors());
app.options('*', cors()); // include before other routes for preflight checks

// Add headers
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

// START THE SERVER
// =============================================================================
var port = process.env.PORT || 8080;
app.listen(port);
router(app);
console.log('Cryptotrage API is on port ' + port);
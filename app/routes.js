var User = require('./models/sequelize.js').User;
var
	RecommendationController = require('../app/models/recommendation/recommendation.controller'),
	BalanceController = require('../app/models/balance/balance.controller'),
	ExchangeController = require('../app/models/exchange/exchange.controller'),
	MarketController = require('../app/models/market/market.controller'),
	PotentialController = require('../app/models/potential/potential.controller'),
	UserController = require('../app/models/user/user.controller'),
	express = require('express');

module.exports = (app) => {
	var apiRoutes = express.Router(),
		balanceRoutes = express.Router(),
		exchangeoutes = express.Router(),
		kpiRoutes = express.Router(),
		marketRoutes = express.Router(),
		potentialRoutes = express.Router(),
		recommendationRoutes = express.Router(),
		userRoutes = express.Router();
	apiRoutes.use((req, res, next) => {
		console.log('Gets called every time');
		User.findOne({
			where: {
				'apiKey': req.header("x-api-key")
			}
		}).then((user, err) => {
			if (err) {
				console.log("ERROR", err);
			} else {
				if (user && user.id) {
					next(); // If validated, go to the next routes and don't stop here
				} else {
					console.log("No soup for you!", req.header("x-api-key"));
				}
			}
		});
	});

	// Recommendation Routes
	apiRoutes.use('/recommendations', recommendationRoutes);
	recommendationRoutes.get('/open', RecommendationController.open);
	recommendationRoutes.get('/closed', RecommendationController.closed);
	recommendationRoutes.get('/:recommendation_id', RecommendationController.getOne);
	recommendationRoutes.get('/', RecommendationController.getAll);

	// Potential Routes
	apiRoutes.use('/potential', potentialRoutes);
	potentialRoutes.get('/:potential_id', PotentialController.getOne);
	potentialRoutes.get('/', PotentialController.getAll);

	// Balance Routes
	apiRoutes.use('/balances', balanceRoutes);
	balanceRoutes.get('/', BalanceController.getAll);

	// KPI Route
	apiRoutes.use('/kpis', kpiRoutes);
	kpiRoutes.get('/', BalanceController.kpis);

	app.use('/api', apiRoutes); // all routes will be prefixed with /api
}
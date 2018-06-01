var User = require('./models/sequelize.js').User;
var
	RecommendationController = require('../app/models/recommendation/recommendation.controller'),
	BalanceController = require('../app/models/balance/balance.controller'),
	PotentialController = require('../app/models/potential/potential.controller'),
	ProductController = require('../app/models/product/product.controller'),
	express = require('express');

module.exports = (app) => {
	var apiRoutes = express.Router(),
		balanceRoutes = express.Router(),
		kpiRoutes = express.Router(),
		potentialRoutes = express.Router(),
		productRoutes = express.Router(),
		recommendationRoutes = express.Router();
	apiRoutes.use((req, res, next) => {
		console.log('Gets called every time');
		User.findOne({
			where: {
				'apiKey': req.header("x-api-key")
			}
		}).then((user, err) => {
			if (err) {
				console.log("ERROR", err);
				res.status(401).json({
					error: 'Invalid api-key.'
				});
			} else {
				if (user && user.id) {
					next(); // If validated, go to the next routes and don't stop here
				} else {
					console.log("No soup for you!", req.header("x-api-key"));
					res.status(401).json({
						error: 'Incorrect!.'
					});
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

	// Product Routes
	apiRoutes.use('/products', productRoutes);
	productRoutes.get('/', ProductController.getAll);

	app.use('/api', apiRoutes); // all routes will be prefixed with /api
}
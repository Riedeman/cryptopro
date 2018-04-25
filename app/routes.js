var
	RecommendationController = require('../app/models/recommendation/recommendation.controller'),
	UserController = require('../app/models/user/user.controller'),
	express = require('express');

module.exports = (app) => {
	var apiRoutes = express.Router(),
		recommendationRoutes = express.Router(),
		userRoutes = express.Router()

	apiRoutes.use((req, res, next) => {
		console.log('Gets called every time');
		//TODO: Validate API-Key
		next(); // make sure we go to the next routes and don't stop here
	});

	// Recommendation Routes
	apiRoutes.use('/recommendations', recommendationRoutes);
	recommendationRoutes.get('/:recommendation_id', RecommendationController.getOne);
	recommendationRoutes.get('/', RecommendationController.getAll);

	// User Routes
	// apiRoutes.use('/users', userRoutes);
	// userRoutes.get('/:user_id', UserController.getOne);
	// userRoutes.get('/', UserController.getAll);

	app.use('/api', apiRoutes); // all routes will be prefixed with /api
}
var Recommendation = require('../sequelize.js').Recommendation;
var _ = require('lodash');
var moment = require('moment');

//RECOMMENDATIONS
exports.getOne = (req, res) => {
	Recommendation.findById(req.params.recommendation_id).then((recommendation, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(recommendation.dataValues);
		}
	});
}

exports.getAll = (req, res) => {
	Recommendation.findAll({}).then((recommendations, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(recommendations);
		}
	});
}


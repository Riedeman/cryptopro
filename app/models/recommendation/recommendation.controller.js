var Recommendation = require('../sequelize.js').Recommendation;
var _ = require('lodash');
var moment = require('moment');

//RECOMMENDATIONS
exports.open = (req, res) => {
	var query = `select * from Recommendations where endResult is null order by updatedAt desc limit 100`;
	Recommendation.sequelize.query(query).spread((results) => {
		res.json(results);
	});
}

exports.closed = (req, res) => {
	var query = `select * from Recommendations where endResult is not null order by updatedAt desc limit 100`;
	Recommendation.sequelize.query(query).spread((results) => {
		res.json(results);
	});
}

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
	Recommendation.findAll({
		order: [
			['id', 'DESC']
		],
		limit: 500
	}).then((recommendations, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(recommendations);
		}
	});
}
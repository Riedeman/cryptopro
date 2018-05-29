var Recommendation = require('../sequelize.js').Recommendation;
var _ = require('lodash');
var moment = require('moment');

//RECOMMENDATIONS
exports.open = (req, res) => {
	Recommendation.findAll({
		where: {
			"endResult": null
		},
		order: [
			['id', 'DESC']
		],
		limit: 100
	}).then((recommendations, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(recommendations);
		}
	});
}

exports.closed = (req, res) => {
	Recommendation.findAll({
		where: {
			"endResult": {
				$ne: null
			}
		},
		order: [
			['id', 'DESC']
		],
		limit: 100
	}).then((recommendations, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(recommendations);
		}
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
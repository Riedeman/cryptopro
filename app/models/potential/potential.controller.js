var Potential = require('../sequelize.js').Potential;
var _ = require('lodash');
var moment = require('moment');

//Potential
exports.getOne = (req, res) => {
	Potential.findById(req.params.potential_id).then((potential, err) => {
		if (err) {
			res.send(err);
		} else {
			if (potential) {
				res.json(potential.dataValues);
			}
		}
	});
}

exports.getAll = (req, res) => {
	Potential.findAll({
		order: [
			['id', 'DESC']
		],
		limit: 200
	}).then((potentials, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(potentials);
		}
	});
}
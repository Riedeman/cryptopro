var Exchange = require('../sequelize.js').Exchange;
var _ = require('lodash');
var moment = require('moment');

//EXCHANGES
exports.getOne = (req, res) => {
	Exchange.findById(req.params.exchange_id).then((exchange, err) => {
		if (err) {
			res.send(err);
		} else {
			if (exchange) {
				res.json(exchange.dataValues);
			}
		}
	});
}

exports.getAll = (req, res) => {
	Exchange.findAll({}).then((exchanges, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(exchanges);
		}
	});
}

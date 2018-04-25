var Exchange = require('../sequelize.js').Exchange;
var _ = require('lodash');
var moment = require('moment');

//EXCHANGES
exports.create = (req, res) => {
	var exchange = Exchange.build();
	exchange = _.merge(exchange, req.body);
	exchange.save().then((exchange, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(exchange.dataValues);
		}
	});
}

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

exports.update = (req, res) => {
	Exchange.findById(req.params.exchange_id).then((exchange, err) => {
		if (err) {
			res.send(err);
		} else {
			exchange = _.merge(exchange, req.body);
			exchange.save().then((updated, err) => {
				if (err) {
					res.send(err);
				} else {
					res.json(updated.dataValues);
				}
			});
		}
	});
}
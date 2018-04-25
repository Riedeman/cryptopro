var Market = require('../sequelize.js').Market;
var _ = require('lodash');
var moment = require('moment');

//MARKETS
exports.create = (req, res) => {
	var market = Market.build();
	market = _.merge(market, req.body);
	market.save().then((market, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(market.dataValues);
		}
	});
}

exports.getOne = (req, res) => {
	Market.findById(req.params.market_id).then((market, err) => {
		if (err) {
			res.send(err);
		} else {
			if (market) {
				res.json(market.dataValues);
			}
		}
	});
}

exports.getAll = (req, res) => {
	Market.findAll({}).then((markets, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(markets);
		}
	});
}

exports.update = (req, res) => {
	Market.findById(req.params.market_id).then((market, err) => {
		if (err) {
			res.send(err);
		} else {
			market = _.merge(market, req.body);
			market.save().then((updated, err) => {
				if (err) {
					res.send(err);
				} else {
					res.json(updated.dataValues);
				}
			});
		}
	});
}
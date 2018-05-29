var Product = require('../sequelize.js').Product;
var _ = require('lodash');
var moment = require('moment');

//PRODUCTS
exports.getOne = (req, res) => {
	Product.findById(req.params.product_id).then((product, err) => {
		if (err) {
			res.send(err);
		} else {
			if (product) {
				res.json(product.dataValues);
			}
		}
	});
}

exports.getAll = (req, res) => {
	Product.findAll({}).then((products, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(products);
		}
	});
}

var User = require('../sequelize.js').User;
var _ = require('lodash');
var moment = require('moment');

//USERS
exports.create = (req, res) => {
	var user = User.build();
	user = _.merge(user, req.body);
	user.save().then((user, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(user);
		}
	});
}

exports.getOne = (req, res) => {
	User.findById(req.params.user_id).then((user, err) => {
		if (err) {
			res.send(err);
		} else {
			if (user) {
				res.json(user);
			}
		}
	});
}

exports.getAll = (req, res) => {
	User.findAll({}).then((users, err) => {
		if (err) {
			res.send(err);
		} else {
			res.json(users);
		}
	});
}

exports.update = (req, res) => {
	User.findById(req.params.user_id).then((user, err) => {
		if (err) {
			res.send(err);
		} else {
			if (user) {
				user = _.merge(user, req.body);
				user.save().then((updated, err) => {
					if (err) {
						res.send(err);
					} else {
						res.json(updated);
					}
				});
			} else {
				console.log("didn't find user")
			}
		}
	});
}
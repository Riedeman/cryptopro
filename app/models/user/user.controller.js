var User = require('../sequelize.js').User;
var _ = require('lodash');
var moment = require('moment');

//USERS
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

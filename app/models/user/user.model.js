'use strict';
module.exports = (sequelize, DataTypes) => {
	var User = sequelize.define('User', {
		apiKey: DataTypes.STRING,
		role: {
			type: DataTypes.ENUM('user', 'admin'),
			defaultValue: 'user'
		},
		lastLogin: DataTypes.DATE,
		status: {
			type: DataTypes.ENUM('newbie', 'active', 'inactive'),
			defaultValue: 'newbie'
		}
	});
	return User;
}
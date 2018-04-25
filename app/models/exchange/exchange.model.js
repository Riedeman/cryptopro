'use strict';
module.exports = (sequelize, DataTypes) => {
	var Exchange = sequelize.define('Exchange', {
		name: DataTypes.STRING
	});
	return Exchange;
};
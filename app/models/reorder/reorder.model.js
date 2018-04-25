'use strict';
module.exports = (sequelize, DataTypes) => {
	var Reorder = sequelize.define('Reorder', {
		recommendationID: DataTypes.INTEGER,
		side: DataTypes.STRING,
		originalTxID: DataTypes.STRING
	});
	return Reorder;
};
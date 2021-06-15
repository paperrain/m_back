const mongoose = require("mongoose");

var itemSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, "username required!"],
		minlength: [3, "username too short"],
		maxlength: [10, "username too long"],
	},
	name: {
		type: String,
		required: [true, "name required!"],
		minlength: [1, "name too short"],
		maxlength: [50, "name too long"],
	},
	image: {
		type: String,
		default: "",
	},
	usedTimes: {
		type: [Date],
		required: true,
		default: [],
	},
	category: {
		type: String,
		required: [true, "category required!"],
	},
});

var item = mongoose.model("item", itemSchema);

module.exports = item;

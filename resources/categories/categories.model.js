const mongoose = require("mongoose");

var categorySchema = mongoose.Schema({
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
	asociatedChallenge: {
		type: String,
		default: "",
	},

	color: {
		type:String,
		default:""
	}
});

var category = mongoose.model("category", categorySchema);

module.exports = category;

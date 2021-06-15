const mongoose = require("mongoose");

var challengeSchema = mongoose.Schema({

	title: {
		type: String,
		required: [true, "title required!"],
		minlength: [3, "title too short"],
		maxlength: [100, "title too long"],
	},
	duration: {
		type: Number,
		required: [true, "duration required!"],
		min: 0
	},
	description: {
		type: String,
		default: "",
	},
	image: {
		type: String,
		default: "",
	},
	numberOfUsersDoingOrDone: {
		type: [String],
		default: [],
	},
	dateAdded:{
		type: Date,
		default: new Date()
	},
	createCategory:{
		type: String,
		unique:true,
		default: "",
	}

});

var challenge = mongoose.model("challenge", challengeSchema);

module.exports = challenge;

const categoryModel = require("./categories.model");
const { deleteAllItemsOfUserCategory } = require("../items/items.controller");
const mongoose = require("mongoose");

module.exports = {
	getAllCategoriesOfUser: getAllCategoriesOfUser,
	getOneCategory: getOneCategory,
	addCategory: addCategory,
	createCategoryForChallenge: createCategoryForChallenge,
	updateCategory: updateCategory,
	deleteCategory: deleteCategory,
	deleteCategoryForChallenge: deleteCategoryForChallenge,
	deleteAllCategory: deleteAllCategory
};

const { unsubscribeChallenge } = require("../challenges/challenges.controller");
// ------- Function Section ----------->

function getAllCategoriesOfUser(req, res) {
	// console.log("all users categories");
	let userToFind = req.currentUser;
	categoryModel
		.find({ username: userToFind })
		.then((response) => {
			// console.log(response);
			res.json(response);
		})
		.catch((error) => res.status(500).send(error));
}

function getOneCategory(req, res) {
	let userToFind = req.currentUser;
	let idToFind = req.params.id;

	if (mongoose.Types.ObjectId.isValid(idToFind)) {
		categoryModel
			.findOne({ _id: idToFind, username: userToFind })
			.then((response) => {
				// console.log(response);
				if (response.length) {
					res.json(response);
				} else {
					res.status(500).send("Not Found");
				}
			})
			.catch((error) => res.status(500).send(error));
	} else {
		res.status(400).send("Bad ID");
	}
}

function addCategory(req, res) {
	let body = req.body;
	let randomNewColor = generateNewColor(req.currentUser);
	categoryModel
		.create({
			username: req.currentUser,
			name: body.name,
			image: "assets/img/categories/categories.png",
			color: randomNewColor
		})
		.then((response) => {
			console.log(`Category ${body.name} created`);
			res.send(response);
		})
		.catch((error) => res.status(500).send(error));
}

function updateCategory(req, res) {
	let body = req.body;

	let userToUpdate = req.currentUser;
	let idToUpdate = req.params.id;

	if (mongoose.Types.ObjectId.isValid(idToUpdate)) {
		categoryModel
			.updateOne({ _id: idToUpdate, username: userToUpdate }, { $set: body }) //{ runValidators: true }
			.then((response) => {
				console.log("Updated category user: " + idToUpdate);
				res.json(response);
			})
			.catch((error) => res.status(500).send(error));
	} else {
		res.status(400).send("Bad ID");
	}
}

function deleteCategory(req, res) {
	let userToDelete = req.currentUser;
	let idToDelete = req.params.id;
	let catToDelete = req.params.category;
	if (mongoose.Types.ObjectId.isValid(idToDelete)) {
		categoryModel.findOneAndDelete({ _id: idToDelete, username: userToDelete })
			.then((response) => {
				deleteAllItemsOfUserCategory(userToDelete, catToDelete);
				if (response.asociatedChallenge !== ""){
					console.log("try to unsubs");
					unsubscribeChallenge(userToDelete, response.asociatedChallenge);
				}
				console.log("Delete Category: " + idToDelete);
				res.json(response);
			})
			.catch((error) => res.status(500).send(error));
	} else {
		res.status(400).send("Bad ID");
	}
}

function deleteAllCategory( userToDelete ) {
	
	categoryModel
		.deleteMany({ username: userToDelete })
		.then((response) => {
			console.log(response);
			console.log("Delete All data of: " + userToDelete);
			return "Ok"
		})
		.catch((error) => res.status(500).send(error));
	
}


function createCategoryForChallenge(currentUser, categoryName, challengeId){
	categoryModel
		.create({
			username: currentUser,
			name: categoryName,
			asociatedChallenge: challengeId,
			image: "assets/img/categories/challenge.png",
			color:"hsl(73, 10%, 39%)"
		})
		.then((response) => {
			console.log(`Category ${categoryName} created`);
			return {categoryName: response.name, categoryId:response._id, status:200};
		})
		.catch((error) => {return {categoryName: categoryName, status:500, error:error}});

}

function deleteCategoryForChallenge(currentUser, challengeId, categoryName){

	categoryModel
		.deleteOne({ asociatedChallenge: challengeId, name:categoryName, username: currentUser })
		.then((response) => {
			deleteAllItemsOfUserCategory(currentUser, categoryName);
			console.log("Delete Category: " + categoryName);
			return {categoryName: "", status:200}
		})
		.catch((error) => {return {categoryName: categoryName, status:500, error:error}});
}


function generateNewColor(userToFind){
	// let categories;
	// categoryModel
	// 	.find({ username: userToFind })
	// 	.then((response) => {
	// 		categories = response;
	// 	}).catch((error) => {console.log(error)});

		while(true){
			let hue = Math.floor(Math.random()*(359 - 0 + 1)) + 0;
			let saturation = Math.floor(Math.random()*(100 - 15 + 1)) + 15;
			let minlightness = 22;
			if(saturation < 30){ minlightness = 35};
			let lightness = Math.floor(Math.random()*(83 - minlightness + 1)) + minlightness;
			let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
			// if (!categories.some(cat=> cat.color === color)){
				console.log(color);
				return color;
			// }
		}

}

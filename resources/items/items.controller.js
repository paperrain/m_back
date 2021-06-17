const itemModel = require("./items.model");
const mongoose = require("mongoose");

module.exports = {
	getAllItems: getAllItems,
	getAllItemsOfUser: getAllItemsOfUser,
	getOneItem: getOneItem,
	addItem: addItem,
	updateAllItems: updateAllItems,
	updateItem: updateItem,
	deleteItem: deleteItem,
	deleteAllItemsOfUser: deleteAllItemsOfUser,
	deleteAllItemsOfUserCategory: deleteAllItemsOfUserCategory

};

// ------- Function Section ----------->

function getAllItems(req, res) {
	itemModel
		.find({})
		.then((response) => {
			res.json(response);
		})
		.catch((error) => res.status(500).send(error));
}

function getAllItemsOfUser(req, res) {
	let userToFind = req.currentUser;
	itemModel
		.find({ username: userToFind })
		.then((response) => {
			response.forEach(item => 
				{
					item.usedTimes.sort((a,b)=>{
						if(a.getTime() > b.getTime()){return -1}
						if(a.getTime() < b.getTime()){return  1}
						return 0;
					})
				});
			res.json(response);
		})
		.catch((error) => res.status(500).send(error));
}

function getOneItem(req, res) {
	let userToFind = req.currentUser;
	let idToFind = req.params.id;

	if (mongoose.Types.ObjectId.isValid(idToFind)) {
		itemModel
			.findOne({ _id: idToFind, username: userToFind })
			.then((response) => {
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

function addItem(req, res) {
	let body = req.body;
	itemModel
		.create({
			username: req.currentUser,
			name: body.name,
			image: body.image,
			usedTimes: body.usedTimes,
			category: body.category,
		})
		.then((response) => {
			res.send(response);
		})
		.catch((error) => res.status(500).send(error));
}

function updateAllItems(req, res) {
	let userToUpdate = req.currentUser;
	dateToCheck = req.body.date;
	console.log("fecha a introducir", dateToCheck); 
	itemsToUpdate = req.body.items;


	if ((dateToCheck) && (itemsToUpdate.length != 0)){ // corroborar que el valor de entrada es un fecha
		dateString = dateToCheck.split("-");
		let date = new Date((+dateString[0]), (+dateString[1])-1, (+dateString[2].substr(0,2)), 12);
		console.log("pasado a date: ", date);	
		itemModel
			.updateMany({ _id: {$in: itemsToUpdate},  
						username: userToUpdate,
						$or: [{usedTimes: {$size: 0}}, {usedTimes: {$ne: date}}]},
					{$push: {usedTimes: date} },
					{new:true}) 
			.then((response) => {
				console.log("respuesta tras updateMany:", response);
				res.json(response);
			})
			.catch((error) => {
				console.log(error);
				res.status(500).send(error)});
	}else{
		console.log("date no es una fecha");
		res.status(400).send("Bad Date");
	}

}
function updateItem(req, res) {
	let body = req.body;
	console.log({body})
	let idToUpdate = req.params.id;
	let userToUpdate = req.currentUser;
	console.log("actualizando un item");

	if (mongoose.Types.ObjectId.isValid(idToUpdate)) {
		itemModel
			.updateOne({ _id: idToUpdate, username: userToUpdate}, 
				{$set: {name: body.name, category: body.category}},
				{new:true}) 
			.then((response) => {
				console.log("respuestaPostUpdateItem: ", response)
				res.json(response);
			})
			.catch((error) => res.status(500).send(error));
	} else {
		res.status(400).send("Bad ID");
	}


}

function deleteItem(req, res) {
	let userToDelete = req.currentUser;
	let idToDelete = req.params.id;
	if (mongoose.Types.ObjectId.isValid(idToDelete)) {
		itemModel
			.deleteOne({ _id: idToDelete, username: userToDelete })
			.then((response) => {
				res.json(response);
			})
			.catch((error) => res.status(500).send(error));
	} else {
		res.status(400).send("Bad ID");
	}
}

function deleteAllItemsOfUser(username){
	itemModel.deleteMany({username: username})
	.then((response) => {
		return response;
	})
	.catch((error) => error);
}

function deleteAllItemsOfUserCategory(username, categoryToDelete) {
	itemModel
		.deleteMany({ username: username, category: categoryToDelete })
		.then((response) => {
			return response;
		})
		.catch((error) => error);
}

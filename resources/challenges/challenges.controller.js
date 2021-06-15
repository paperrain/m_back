const challengeModel = require("./challenges.model");
const mongoose = require("mongoose");

module.exports = {
    getAllChallenges: getAllChallenges,
	addChallenge: addChallenge,
	updateChallenge: updateChallenge,
	deleteChallenge: deleteChallenge,
    updateChallengeUserDeleted: updateChallengeUserDeleted,
    unsubscribeChallenge: unsubscribeChallenge
};

const {createCategoryForChallenge, deleteCategoryForChallenge} = require("../categories/categories.controller")


function getAllChallenges(req, res){
    let userToFind = req.currentUser;
    challengeModel
        .find({})
        .then(response => {
            // console.log(response);
            challengesOfActualUser = [];
            if (response.length !== 0){
                response.forEach(challenge => {
                    challengesOfActualUser.push({
                        _id: challenge._id,
                        title: challenge.title,
                        duration: challenge.duration,
                        description: challenge.description,
                        image: challenge.image,
                        dateAdded: challenge.dateAdded,
                        subscribed: challenge.numberOfUsersDoingOrDone.includes(userToFind),
                        numberOfUsersDoingOrDone: challenge.numberOfUsersDoingOrDone.length,
                        createCategory: challenge.createCategory,
                    });
                })
            }
            // console.log(challengesOfActualUser);
            res.status(200).json(challengesOfActualUser);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
}

async function updateChallenge(req, res){  // <-- revisar para reducir código
    console.log("sub/desSubs");
    let userToFind = req.currentUser;
    let idChallenge = req.params.id;
    challengeModel
        .findOneAndUpdate({_id: idChallenge, numberOfUsersDoingOrDone: {$ne: userToFind}},
            {$push: {numberOfUsersDoingOrDone: userToFind}}, 
            {new:true}) // comprobar que existe previamente
        .then(challenge => {
            challengeChanged = {};
            // console.log("busacando si ya esta subscrito si no está se añade:");
            if (challenge){
                console.log("subscrito!")
                if(challenge.createCategory !== ""){
                    console.log("creando categoría: ", challenge.createCategory + "-challenge");
                    var resController = createCategoryForChallenge(userToFind, 
                                                            challenge.createCategory + "-challenge", 
                                                            challenge._id);
                    // console.log("rescontroller: ", resController);
                    // if(resController.status === 200 && resController.categoryId){
                    //     // categoryId =  resController.categoryId;
                    //     console.log("categoría creada");
                    // }else{
                    //     // categoryId = "";
                    //     console.log("categoría no creada");
                    // } 
                }else{
                    console.log("challenge sin categoria especial");
                    // categoryId = "";
                }

                challengeChanged = {
                    _id: challenge._id,
                    title: challenge.title,
                    duration: challenge.duration,
                    description: challenge.description,
                    image: challenge.image,
                    dateAdded: challenge.dateAdded,
                    subscribed: challenge.numberOfUsersDoingOrDone.includes(userToFind),
                    numberOfUsersDoingOrDone: challenge.numberOfUsersDoingOrDone.length,
                    createCategory: challenge.createCategory,
                };
                
                // console.log(challengeChanged);
                res.status(200).json(challengeChanged);
            }else{
                // console.log(`fallo, usuario subscrito o no existe el reto con id: ${idChallenge}`);
                challengeModel.findByIdAndUpdate({_id: idChallenge}, 
                    {$pull: {numberOfUsersDoingOrDone: userToFind}},
                    {new:true})
                    .then(challenge => {
                        challengeChanged = {};
                        // console.log(challenge)
                        if(challenge.createCategory !== ""){
                            console.log("borrando categoría: ", challenge.createCategory + "-challenge");
                            resController = deleteCategoryForChallenge(userToFind, challenge._id, challenge.createCategory + "-challenge");
                            console.log("rescontroller: ", resController);
                            // if(resController.status === 200 && resController.categoryName === ""){
                            //     // categoryId =  "";
                            //     console.log("categoría borrada");
                            // }else{
                            //     // categoryId = "deleting category error";
                            //     console.log("deleting category error");
                            // } 
                        }else{
                            console.log("challenge sin categorias especiales");
                            // categoryId = "";
                        }

                        if (challenge){
                            challengeChanged = {
                                _id: challenge._id,
                                title: challenge.title,
                                duration: challenge.duration,
                                description: challenge.description,
                                image: challenge.image,
                                dateAdded: challenge.dateAdded,
                                subscribed: challenge.numberOfUsersDoingOrDone.includes(userToFind),
                                numberOfUsersDoingOrDone: challenge.numberOfUsersDoingOrDone.length,
                                createCategory: challenge.createCategory,
                            };
                            // console.log({challengeChanged});
                            res.status(200).json(challengeChanged); 
                        }else{
                            res.status(400).send("this challenge exist");
                        }
                    }).catch(error => {
                        console.log(error);
                        res.status(500).send(error);
                    });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
}

function updateChallengeUserDeleted(username){
    challengeModel
    .updateMany({numberOfUsersDoingOrDone: {$eq: username}},
                {$pull: {numberOfUsersDoingOrDone: username}},
                {new:true})
    .then(res => res)
    .catch(error => error);
    
    
}

function addChallenge(req, res){
    let body = req.body;
	challengeModel
		.create({
            title: body.title,
            duration: body.duration,
            description: body.description,
            image: body.image,
            numberOfUsersDoingOrDone: [], // <-- mirar si separar
            dateAdded: new Date(),
            createCategory: body.createCategory,
		})
		.then((response) => {
            if (!response){
                res.send("error challenge not generated");
            }
			res.send(response);
		})
		.catch((error) => res.status(500).send(error));
}


function deleteChallenge(req, res){
    let idChallenge = req.params.id;
    challengeModel.deleteOne( { _id: idChallenge } )
        .then( response => {
            console.log(response);
            if(response.deletedCount === 0){ // comprobar si hay caso que no entre aquí
                return res.status(404).send( `not challenge deleted` );
            }else{
                res.status(200).send("challenge deleted");
            }
        }).catch( error => {
            res.status(500).send( error );
        } );
}

function unsubscribeChallenge(username, challengeId){
    console.log("dessubscribiendo");
    challengeModel.findByIdAndUpdate({_id: challengeId}, 
        {$pull: {numberOfUsersDoingOrDone: username}},
        {new:true})
        .then(challenge =>{
            console.log(`unsubscribed from ${challenge.title}`)
        }).catch(error => {console.log(error)});
    return
}

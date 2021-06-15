const userModel = require( './users.model' );
const {deleteAllItemsOfUser} = require("../items/items.controller");
const {updateChallengeUserDeleted} = require("../challenges/challenges.controller");
const {deleteAllCategory} = require("../categories/categories.controller");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

var nodemailer = require('nodemailer');
// const hbs = require('nodemailer-express-handlebars');

// Generate verification number
let verificationNumber = 0;

module.exports = {

    getAllUsers : getAllUsers,
    getLoggedUser: getLoggedUser,
    checkField: checkField,
    checkUser: checkUser,
    verifyUser : verifyUser,
    registerUser : registerUser,
    loginUser : loginUser,
    updateUser : updateUser,
    updatePassword : updatePassword,
    deleteUser : deleteUser


};

// ------- Function Section ----------->

// Destruir antes de publicar
function getAllUsers( req, res ){

    userModel.find({}).then( response => {

        res.json(response);

    } ).catch( error => {

        res.status(500).json( error );

    } );

}

function getLoggedUser(req, res){
    console.log("pidiendo información de usuario");
    let userLogged = req.currentUser;
    try{
        userModel.find({username: userLogged}).then( response => {
            if(response){
                delete response[0].password;
                res.json(response[0]);
            }else{
                return "error user not found";
            }
        })

    }catch(error){
        res.status(500).json( error );
    }

}

function checkField(req, res){
    let field = req.params.field

    userModel.find({username: field})
    .then(response => {
        console.log(response);
        if(response.length !== 0){
            console.log(`fieldusername: ${field} exist already`);
            res.status(400).send("User alredy exist");
        }
    })
    .catch(()=>res.status(500).send("error server"));

    userModel.find({email: field})
    .then(response => {
        // console.log(response);
        if(response.length === 0){
            // console.log(`fieldemail: ${field} not exist already`);
            res.status(200).send("ok");
        }else{
            // console.log(`fieldemail: ${field} exist already`);
            res.status(400).json("email already exists")
        }
    })
    .catch(()=>res.status(500).json("error server"));
}

function checkUser(req, res){

    let user = req.params.username;

    userModel.find({username: user})
    .then(response => {
        console.log(response);

        if(response.length > 0 ){
            // console.log(`Username: ${user} exist already`);
            res.status(200).send(response[0].email);
        } else {
            // console.log(`Username: ${user} no exist`);
            res.status(404).send("No found username");
        }
    })
    .catch(()=>res.status(500).send("error server, no sé porqué"));
}


function verifyUser(req, res){

    // Generate verification number
    verificationNumber = Math.round(Math.random() * (999999 - 100000) + 100000); 

    // Send a verification email to the new user
    sendEmail(req, verificationNumber);

    res.status(200).json(verificationNumber);

}


function registerUser( req, res ){

    let body = req.body;
    const hash =  bcrypt.hashSync(body.password, 10);

    if( body.username == "" || body.email == "" || body.password == "" ){

        res.status(500).send('All fields must be filled.');

    } else {
        
        userModel.create({
    
            "username" : body.username,
            "email" : body.email,
            "password" : hash,
            "avatar": body.avatar
    
        }).then( response => {
    
            console.log( 'User created!' );
            res.json( response ); 
    
        }).catch( error => { res.status(500).send(error) });
    }

};

//  ----- Revisar, no termina de verificar correctamente con el hasheo
function loginUser( req, res ){
    let body = req.body;

    if( body.username == "" || body.password == "" ){

        res.status(500).send('All fields must be filled.');

    } else {

        userModel.find( { username : body.username } )
        .then( response => {
            if( response.length === 0){
                return res.status(404).send( `The user ${body.username} is not found` );
            }
    
            var validatePassword = bcrypt.compareSync(body.password, response[0].password);
    
            if(validatePassword){
                var token = jwt.sign( response[0].username , process.env.TOKEN );     
                res.status(200).send(token);
                console.log('The user exits');
            } else {
                res.status(400).send('Wrong user name or password!');
                console.log('Wrong user name or password!');  
            }
        })
        .catch( error => {
            console.log( error );
            res.status(500).json( error );     
        });
    }
    
    
}

function updateUser(req, res) {
    
    let body = req.body;
    let userNameToEdit = req.currentUser;
    console.log("updating user: ", userNameToEdit);
    if (body.password){
        delete body.password;
    }
    console.log("body:", body);
    userModel.updateOne({ username: userNameToEdit }, { $set: body } )
    .then(response => {
        console.log(response);
        res.json(response);
    }).catch( error => {
            console.log( error );
            res.status(500).json( error );
    
        } );
}

function updatePassword(req, res) {
    console.log("updating password");
    console.log(req.body.user);
    let body = req.body.user;
    const hash =  bcrypt.hashSync(body.password, 10);
    userModel.updateOne({ username: body.username }, { password: hash } )
    .then(response => {
        res.json(response);
    }).catch( error => {
            console.log( error );
            res.status(500).json( error );
    
        } );
}

function deleteUser(req, res) {
    let userToDelete = req.currentUser;
    userModel.deleteOne( { username: userToDelete } )
        .then( response => {
            if (response && response.deletedCount === 1){
                deleteAllItemsOfUser(userToDelete);
                updateChallengeUserDeleted(userToDelete);
                deleteAllCategory(userToDelete);
                res.status(200).json('Deleted user ' + userToDelete);
            }else{
                res.status(404).send( "usuario no encontrado" );
            }
        }).catch( error => {
            console.log(error);
            res.status(500).json( error );
        } );
}

// Email sender function
function sendEmail(req, verificationNumber){

    // Definition of transporter
        var smtpConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use SSL
            auth: {
                user: 'minimalist.style.team@gmail.com',
                pass: process.env.MINIMALISSTYLEEMAL,
            },
            tls: {
                secureProtocol: "TLSv1_method",
                rejectUnauthorized: false
            }
        };
        var transport = nodemailer.createTransport(smtpConfig);

        // var options = {
        //     viewEngine: {
        //         extname: '.handlebars',
        //         layoutsDir: 'views/',
        //         defaultLayout : 'index',
        //         partialsDir: 'views/partials/'
        //     },
        //     viewPath: 'views/'
        // }
        // var options = {
        //     viewEngine: {
        //         extname: '.html',
        //         layoutsDir: 'views/',
        //         defaultLayout : 'index',
        //         // partialsDir: 'views/partials/'
        //     },
        //     viewPath: 'views/'
        // }
        // console.log(options);

        // transport.use( 'compile', hbs(options));

        transport.verify(function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });

    
        // Describe the email
        var mailOptions = {
            from: 'Minimalist Style <minimalist.style.team@gmail.com>',
            to: req.body.email,
            subject: 'Email Verification',
            text: "Hello!!\n We are glad to see you here 😁\n\n\n" + "This is your verification code: " + verificationNumber 
            + "\n\n\n Did you know about our Challenges? \m Take a look in http://clasiko.es/challenges"
            // template: 'index',
            // attachments: [
            //     { filename: "lince1.png", path: "./views/img/lince1.png" }
            // ]
        };
        // Send the email
        transport.sendMail(mailOptions);
}
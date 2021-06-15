var router = require('express').Router();
const controller = require( '../users/users.controller' );
const authToken = require("../../middlewares/authToken")

// ---------- Routing Section ------------ >



// Get All User <-- Eliminar en producción
router.get( '/', authToken, controller.getLoggedUser);


// User verification
router.post( '/register/verification', controller.verifyUser);

// New User
router.get( '/register/:field', controller.checkField);

// New User
router.post( '/register', controller.registerUser);

// Check User
router.post( '/login', controller.loginUser );

// Modify User
router.patch( '/', authToken, controller.updateUser );

// Recover password
router.patch( '/recover', controller.updatePassword);

// Check User to recover password
router.get( '/recover/:username', controller.checkUser);

// Delete User
router.delete( '/', authToken, controller.deleteUser );


module.exports = router;

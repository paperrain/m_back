const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

var userSchema = mongoose.Schema({
    
    username: {
        type: String,
        require: [true, 'Introduzca su nombre'],
        unique: [true, 'Username already exits'],
        minlength: 3,
        maxlength: 10
    },
    email: {
        require: [true, 'Introduzca su email'],
        unique: [true, 'Email already exits'],
        type: String,
        minlength: 6,
        maxlength: 50,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Introduzca un correo valido']
    },
    password: {
        required: [true, 'Introduzca su contraseña'],
        type: String,
        minlength: 3,
        maxlength: 100
    },
    avatar: {
        required: [true],
        type: String
    }

});

userSchema.plugin(beautifyUnique);

var user = mongoose.model( 'user', userSchema );

module.exports = user;


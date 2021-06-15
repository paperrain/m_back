const jwt = require('jsonwebtoken');

const authToken = function (req, res, next) {
    token = req.headers.authorization;
    jwt.verify(token, process.env.TOKEN, (error, data) =>{
        if (error){
            return res.status(401).send("Error usuario loggeado");
        }
        console.log(`usuario ${data} solicitando ${req.method}`);
        req.currentUser = data;
        next();
    });
}


module.exports = authToken;
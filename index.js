// Access to the data base .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const port = 3000;

// DB connect
// mongoose.connect('mongodb://localhost/users');
mongoose.set("useCreateIndex", true).connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Create server
const server = express();

// Cors Config
var corsOptions = {
	origin: process.env.FRONT_URL,
	optionsSuccessStatus: 200, // For legacy browser support
	methods: "GET, PUT, POST, PATCH, DELETE",
};

// URL Permissions
server.use(cors(corsOptions));

// Middleware
server.use(express.json());

// Resources Users & Items
const userRouter = require("./resources/users/index");
const itemRouter = require("./resources/items/index");
const challengeRouter = require("./resources/challenges/index");
const categoryRouter = require("./resources/categories/index");

server.use("/item", itemRouter);
server.use("/challenge", challengeRouter);
server.use("/category", categoryRouter);
server.use("/", userRouter);

// Call Server
server.listen(process.env.PORT || port, () => {
	console.log(`escuchando el puerto ${port} dentro de docker`);
});

var router = require("express").Router();
const controller = require("./challenges.controller");
const authToken = require("../../middlewares/authToken")

// ---------- Routing Section ------------ >

// Get All challenges
router.get("/", authToken, controller.getAllChallenges);

// // Modify challenge
router.patch("/:id", authToken, controller.updateChallenge);

// New challenge
router.post("/", controller.addChallenge); // añadir roles?

// Delete challenge
router.delete("/:id", controller.deleteChallenge); // añadir roles?

module.exports = router;

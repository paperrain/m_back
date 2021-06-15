var router = require("express").Router();
const controller = require("./items.controller");
const authToken = require("../../middlewares/authToken")

// ---------- Routing Section ------------ >

// Get All Items of User
router.get("/", authToken, controller.getAllItemsOfUser);

// Get One Item
router.get("/:id", authToken, controller.getOneItem);

// New Item
router.post("/", authToken, controller.addItem);

// // Modify item
router.patch("/", authToken, controller.updateAllItems)
router.patch("/:id", authToken, controller.updateItem);

// Delete item
router.delete("/:id", authToken, controller.deleteItem);

module.exports = router;

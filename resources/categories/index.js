var router = require("express").Router();

const controller = require("./categories.controller");
const authToken = require("../../middlewares/authToken");

// ---------- Routing Section ------------ >

// // Get All Items <--- borrar al final!!
// router.get("/", controller.getAllItems);

// Get All Items of User
router.get("/", authToken, controller.getAllCategoriesOfUser);

// Get One Item
router.get("/:id", authToken, controller.getOneCategory);

// New Item
router.post("/", authToken, controller.addCategory);

// Modify item
router.patch("/:id", authToken, controller.updateCategory);

// Delete item
router.delete("/:id/:category", authToken, controller.deleteCategory);

module.exports = router;

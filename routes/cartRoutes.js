const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");
const { verify } = require("../middleware/verify");

// Cart routes (all require authentication)
router.get("/", verify, cartController.getCart);
router.post("/add/:courseId", verify, cartController.addToCart);
router.delete("/remove/:courseId", verify, cartController.removeFromCart);
router.delete("/clear", verify, cartController.clearCart);

module.exports = router;
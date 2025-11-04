const Cart = require("../models/Cart");
const Course = require("../models/Course");
const Student = require("../models/Student");

// Get cart contents
async function getCart(req, res) {
  try {
    const studentId = req.user._id;
    console.log("Fetching cart for student:", studentId);
    let cart = await Cart.findOne({ student: studentId }).populate({
      path: "items.course",
      select: "title description price image",
    });

    if (!cart) {
      cart = { items: [] }; // Return empty cart if none exists
    }

    res.json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving cart",
    });
  }
}

// Add course to cart
async function addToCart(req, res) {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;
    console.log("Adding course to cart:", courseId, "for student:", studentId);

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ student: studentId });
    if (!cart) {
      cart = new Cart({
        student: studentId,
        items: [],
      });
    }

    // Check if course is already in cart
    const isInCart = cart.items.some(
      (item) => item.course.toString() === courseId.toString()
    );

    if (isInCart) {
      return res.json({
        success: false,
        message: "Course is already in cart",
      });
    }

    // Add course to cart
    cart.items.push({
      course: courseId,
      addedAt: new Date(),
    });

    await cart.save();

    // Return populated cart
    cart = await Cart.findOne({ student: studentId }).populate({
      path: "items.course",
      select: "title description price image",
    });

    res.json({
      success: true,
      message: "Course added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding course to cart",
    });
  }
}

// Remove course from cart
async function removeFromCart(req, res) {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    const cart = await Cart.findOne({ student: studentId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Remove course from items array
    cart.items = cart.items.filter(
      (item) => item.course.toString() !== courseId.toString()
    );

    await cart.save();

    res.json({
      success: true,
      message: "Course removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing course from cart",
    });
  }
}

// Clear entire cart
async function clearCart(req, res) {
  try {
    const studentId = req.user._id;

    const cart = await Cart.findOne({ student: studentId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
    });
  }
}

async function updateEnrollCourses(req, res) {
  console.log(req.body);
  const { courseIds } = req.body;
  console.log(courseIds);
  const studentId = req.user._id;
  try {
    const students = await Student.findByIdAndUpdate(
      studentId,
      {
        $addToSet: {
          enrolledCourses: {
            $each: courseIds,
          },
        },
      },
      { new: true }
    );

    const updatedCart = await Cart.updateOne(
      { student: studentId },
      {
        $set: { items: [] },
      }
    );

    await Promise.all(
      courseIds.map((courseId) =>
        Course.findByIdAndUpdate(courseId, {
          $push: {
            students: studentId,
          },
        })
      )
    );

    res.json({
      message: "Student courses retrieved successfully",
      data: updatedCart,
      success: true,
      error: false,
    });
  } catch (error) {
    console.log("err occured...", error);
    es.json({
      message: error?.message || error,
      success: false,
      error: true,
    });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateEnrollCourses,
};

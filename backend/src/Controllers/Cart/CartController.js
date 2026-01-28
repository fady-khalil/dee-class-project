// Make sure the import is at the top
import Cart from "../../Modules/Cart.model.js";
import User from "../../Modules/User.model.js";
import transporter from "../../middlewares/SendMail.js";

// Add this function to handle cart status updates
export const updateCartStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id || req.user.id || req.user.userId;

    console.log("Updating cart status for user:", userId, "to:", status);

    // Validate status
    if (!status || !["active", "pending", "completed"].includes(status)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid status. Must be 'active', 'pending', or 'completed'.",
      });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create one (but don't allow setting pending status on an empty cart)
    if (!cart) {
      console.log("No cart found for user, creating new cart");

      if (status === "pending") {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Cannot set pending status on a non-existent cart",
        });
      }

      cart = new Cart({
        user: userId,
        books: [],
        courses: [],
        total: 0,
        status: status,
        lastStatusUpdate: new Date(),
      });

      await cart.save();

      return res.status(200).json({
        status: 200,
        success: true,
        message: "New cart created with status: " + status,
        data: cart,
      });
    }

    // Check if cart is empty when trying to set to pending
    if (status === "pending" && cart.courses.length === 0) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Cannot update status of an empty cart to pending",
      });
    }

    // Log the cart contents for debugging
    console.log("Found cart:", {
      id: cart._id,
      courses: cart.courses.length,
      total: cart.total,
    });

    // Update cart status and timestamp
    cart.status = status;
    cart.lastStatusUpdate = new Date();
    await cart.save();

    console.log("Cart status updated successfully to:", status);

    res.status(200).json({
      status: 200,
      success: true,
      message: `Cart status updated to ${status}`,
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart status:", error);
    res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to update cart status: " + error.message,
    });
  }
};

// Send checkout notification emails to admin and user when cart is pending
export const sendCheckoutNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;

    // Fetch user basic info
    const user = await User.findById(userId).select("fullName email");
    if (!user) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    // Fetch user's cart with populated items
    const cart = await Cart.findOne({ user: userId })
      .populate("courses.courseId", "title price slug");

    if (!cart || cart.courses.length === 0) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "No items in cart to notify",
      });
    }

    if (cart.status !== "pending") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Cart must be pending to send notifications",
      });
    }

    // Compose the same message used for WhatsApp
    let message = `*📝 NEW ORDER REQUEST*\n\n`;
    message += `Hello, I'm *${user.fullName || "a customer"}*.\n`;
    message += `I would like to place an order for the following items:\n\n`;

    if (cart.courses.length > 0) {
      message += `*🎓 COURSES 🎓*\n`;
      message += `------------------\n`;
      cart.courses.forEach((course, index) => {
        const title =
          course.title || course.courseId?.title || "Untitled Course";
        const price = course.price || course.courseId?.price || 0;
        message += `${index + 1}. *${title}*\n   Price: $${price}\n`;
      });
      message += `\n`;
    }

    message += `*💰 ORDER SUMMARY 💰*\n`;
    message += `------------------\n`;
    message += `*Total Amount: $${(cart.total || 0).toFixed(2)}*\n\n`;
    message += `Thank you!`;

    // Convert to a simple HTML representation
    const htmlFromMessage = message
      .replaceAll("\n", "<br/>")
      .replaceAll("*", "");

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.SENDER_EMAIL;

    // Send email to admin
    if (adminEmail) {
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: adminEmail,
          subject: `New Order Request - ${user.fullName || user.email}`,
          text: message.replaceAll("*", ""),
          html: `<div>${htmlFromMessage}</div>`,
        });
      } catch (e) {
        console.error("Failed to send admin notification email:", e);
        // continue; we still try to send user email
      }
    } else {
      console.warn("ADMIN_EMAIL not set. Skipping admin notification.");
    }

    // Send email to user (acknowledgement)
    try {
      await transporter.sendMail({
        from: fromEmail,
        to: user.email,
        subject: "Order Received - Under Review",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 16px;">
            <h2>Thank you for your order, ${user.fullName || "Customer"}!</h2>
            <p>Your order has been received and is currently under review. We will contact you shortly to confirm the details and next steps.</p>
            <h3>Order Summary</h3>
            <div>${htmlFromMessage}</div>
            <p style="margin-top: 16px;">If you have any questions, just reply to this email.</p>
          </div>
        `,
        text:
          `Thank you for your order! Your order is under review.\n\n` +
          message.replaceAll("*", ""),
      });
    } catch (e) {
      console.error("Failed to send user acknowledgement email:", e);
      // still respond success for admin notification case
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Checkout notifications processed",
    });
  } catch (error) {
    console.error("Error sending checkout notifications:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to send checkout notifications",
    });
  }
};

import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "pending", "completed"],
      default: "active",
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total
CartSchema.pre("save", function (next) {
  let total = 0;

  // Sum up course prices
  if (this.courses && this.courses.length > 0) {
    this.courses.forEach((course) => {
      total += course.price;
    });
  }

  this.total = total;
  next();
});

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;

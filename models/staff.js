const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    position: { type: String, required: true },
    department: { type: String, required: true },
    hire_date: { type: Date },
    salary: { type: Number },
    is_admin: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Terminated"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);

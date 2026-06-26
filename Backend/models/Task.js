const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "To Do",
        "In Progress",
        "Review",
        "Done",
      ],
      default: "To Do",
    },

    dueDate: {
      type: Date,
    },

    assignee: {
      type: String,
      default: "Unassigned",
    },

    taskCode: {
      type: String,
      default: "",
    },

    estimate: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Task",
  taskSchema
);
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  reviewerId:{
    type: String,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,

  },
  result:{
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("results", UserSchema);

module.exports = model;

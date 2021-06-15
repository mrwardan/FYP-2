const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  examinerOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examiner",

  },
  examinerTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examiner",

  },
  chairPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chairperson",

  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
  },
  result:{
    type: String,
    required: true,
  },
  comments: {
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

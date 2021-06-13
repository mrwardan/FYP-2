const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "supervisor",
  },
  examinerOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examiner",

  },
  examinerTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examiner",

  },
  chairpersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chairperson",

  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
  },
  examDate: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("examinfo", UserSchema);

module.exports = model;

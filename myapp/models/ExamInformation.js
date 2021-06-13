const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  supervisorId: {
    type: String,
    required: true,
  },
  examiner1Id: {
    type: String,
    required: true,

  },
  examiner2Id: {
    type: String,
    required: true,

  },
  chairpersonId: {
    type: String,
    required: true,

  },

  studentId: {
    type: String,
    required: true,
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

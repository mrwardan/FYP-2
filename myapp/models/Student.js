const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "Student",
  },
  projectType: {
    type: String,
  },
  matricNo: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
  },
  program: {
    type: String,
  },
  semester: {
    type: String,
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "supervisor",
  },
  nationality: {
    type: String,
  },
  thesisTitle: {
    type: String,
  },
  image: {
    type: String,
  },
  examinerOneApproved: {
    type: Boolean,
  },
  chairPersonApproved: {
    type: Boolean,
  },
  chairPersonReject: {
    type: Boolean,
  },
  examinerOneReject: {
    type: Boolean,
  },
  examinerTwoReject: {
    type: Boolean,
  },

  examinerTwoApproved: {
    type: Boolean,
  },
  chairPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chairperson",
  },
  submittedDate: {
    type: "date",
  },
  examinerOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examiner",
  },
  examinerTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examiner",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("student", UserSchema);

module.exports = model;

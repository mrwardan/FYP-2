const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    default: "Chairperson",
  },
  fullName: {
    type: String,
    required: true,
  },
  staffNo: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  postion: {
    type: String,
  },
  major: {
    type: String,
    required: true,
  },
  institute: {
    type: String,
  },
  image: {
    type: String,
    default: "wardan.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("chairperson", UserSchema);

module.exports = model;

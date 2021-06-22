const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    default: "Admin",
  },
  fullName: {
    type: String,
    required: true,
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
  type: {
    type: String,
    default: "Admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("admin", UserSchema);

module.exports = model;

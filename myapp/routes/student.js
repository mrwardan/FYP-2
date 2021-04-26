const USER = require('../models/User');
var express = require("express");
const route = express.Router();
const STUDENT = require("../models/Student");
const SUPERVISOR = require("../models/Supervisor");
const EXAMINER = require("../models/Examiner");
const CHAIRPERSON = require("../models/Chairperson");

const multer = require("multer");
const path = require("path");
const { findById } = require("../models/Student");
const Swal = require("sweetalert2");
const formidable = require("formidable");
var fs = require("fs");



//define storage for the images
const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, "./public/upload/images");
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
  fileFilter: function (req, file, cb) {
    let ch = checkFileType(file, cb);
    console.log(ch);
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

route.get('/dashboard',ensureAuth, (req, res, next) =>
{

    res.render('Student/dashboard', {user: req.session.user,layout: 'mainS'})
})
route.get('/home',ensureAuth, (req, res, next) =>
{
    res.render('Student/dashboard', {user: req.session.user, layout: 'mainS'})
})
route.get('/profile', ensureAuth,(req, res, next) =>
{
    res.render('Student/profile', {user: req.session.user, layout: 'mainS'})
})
route.get('/uploadDocuments', ensureAuth,(req, res, next) =>
{
    res.render('Student/uploadDocuments', {user: req.session.user, layout: 'mainS'})
})
route.get('/signout', ensureAuth,(req, res, next) =>
{
  req.session.destroy();
  res.render("login", { layout: false });
})
route.get('/getSV', ensureAuth,async (req, res, next) =>
{
  try {
     const SV = await STUDENT.findById(req.session.user._id).lean().populate('supervisorId');
    // const SV = await SUPERVISOR.findById(req.session.user.supervisorId).lean();
    res.json(SV);
    
  } catch (error) {
    res.json(error);
    
    
  }
})
route.post(
  "/profile",
  ensureAuth,
  upload.single("image"),
  async (req, res, next) => {
     console.log('Req file',req.file);
    console.log('req body',req.body);

    await STUDENT.findByIdAndUpdate(
      req.session.user._id,
      { image: req.file.filename },
      { new: true },

      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: "Database Update Failure",
          });
        }
        req.session.user = response;
        res.redirect("profile");
        console.log("This is the Response: " + response);
      }
    );
  }
);




function ensureAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}
function ensureStudent(req, res, next) {
  const secret = req.session.user.Auth;
  if (secret === "SupAuth_$") {
    next();
  } else {
    res.redirect(req.get("referer"));
  }
}

module.exports = route;

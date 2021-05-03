var express = require("express");
const route = express.Router();
const USER = require("../models/User");
const CHAIRPERSON = require("../models/Chairperson");
const EXAMINER = require("../models/Examiner");
const STUDENT = require("../models/Student");
const SUPERVISOR = require("../models/Supervisor");
const ADMIN = require("../models/Admin");
const multer = require("multer");
const path = require("path");
const Swal = require("sweetalert2");
const {ensureAuth}=require('../middleware/auth')


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

route.get("/dashboard", ensureAuth, ensureAdmin, async(req, res, next) => {
  let adminid = req.session.user.userId;
  const admin = await ADMIN.findById(adminid).lean();
  res.render("Admin/adminHome", {  user: admin,layout: "mainAdmin" });
});
route.get("/Home", ensureAuth, ensureAdmin,async (req, res, next) => {
  let adminid = req.session.user.userId;
  const admin = await ADMIN.findById(adminid).lean();
  res.render("Admin/adminHome", {  user: admin,layout: "mainAdmin" });
});
route.get("/profile", ensureAuth, ensureAdmin,async (req, res, next) => {
  //console.log("The session user: ",req.session.user);
  let adminid = req.session.user.userId;
  const admin = await ADMIN.findById(adminid).lean();
  //console.log('admin: ',admin);
  res.render("Admin/profile", { user: admin,layout: "mainAdmin" });
});
route.get("/editinfo", ensureAuth, ensureAdmin, (req, res, next) => {
  res.render("Admin/editinfo", { user: req.session.user, layout: "mainAdmin" });
});

route.get("/manageUsers", ensureAuth, ensureAdmin, async (req, res) => {
  const admins = await ADMIN.find({}).lean();
  const examiners = await EXAMINER.find({}).lean();
  const students = await STUDENT.find({}).lean();
  const supervisors = await SUPERVISOR.find({}).lean();
  const chairpeople = await CHAIRPERSON.find({}).lean();

  //res.json(users);

  res.render("Admin/Dashboard", {
    supervisors: supervisors,
    students: students,
    examiners: examiners,
    admins: admins,
    chairpeople: chairpeople,
    layout: "mainAdmin",
  });
});

route.get("/delete/:id", ensureAuth, ensureAdmin, async (req, res) => {
  const user = await USER.findOne({ userId: req.params.id });
  const user1 = await EXAMINER.findOne({ _id: req.params.id });
  const user2 = await CHAIRPERSON.findOne({ _id: req.params.id });
  const user3 = await SUPERVISOR.findOne({ _id: req.params.id });
  const user4 = await ADMIN.findOne({ _id: req.params.id });

  switch (user.type) {
    case "Admin":
      if (user4) {
        console.log("great");

        await ADMIN.findByIdAndDelete(user4);
      }
      break;
    case "Supervisor":
      if (user3) {
        console.log("great");

        await SUPERVISOR.findByIdAndDelete(user3);
      }
      break;
    case "Examiner":
      if (user1) {
        console.log("great");

        await EXAMINER.findByIdAndDelete(user1);
      }
      break;
    case "Chairperson":
      if (user2) {
        console.log("great");

        await CHAIRPERSON.findByIdAndDelete(user2);
      }
      break;

    default:
      break;
  }

  if (user) {
    await USER.findByIdAndDelete(user);
  }

  res.redirect("Admin/Dashboard");
});

route.get("/view/:id", ensureAuth, ensureAdmin, async (req, res) => {
  console.log("id: ", req.params.id);

  const { id } = req.params;
  console.log("log", id);

  try {
    var user = await USER.findOne({ userId: id });
    console.log(user);

    if (user) {
      res.json(user);
    } else {
      res.send("info not find");
    }
  } catch (error) {
    console.log(error);
    res.send(" not find");
  }
});

route.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

route.get("/adminHome", ensureAuth, ensureAdmin, (req, res) => {
  res.render("adminHome", { user: req.session.user });
});

route.post(
  "/profile",
  ensureAuth,
  ensureAdmin,
  upload.single("image"),
  async (req, res, next) => {
     console.log('The req file : ',req.file);
     console.log('The req body : ',req.body);

    await ADMIN.findByIdAndUpdate(
      req.session.user.userId,
      { image: req.file.filename },
      { new: true },

      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: "Database Update Failure",
          });
        } else{
          console.log("This is the Response: " + response);
          req.session.user = response;
        }
       
       
        res.redirect("profile");
      }
    );
  }
);

route.post("/editinfo", ensureAuth, ensureAdmin, async (req, res, next) => {
  const { fullName, phone, postion, institute, major } = req.body;

  //console.log("The request file:", req.file);
  var admin_id = req.session.user.userId;

  try {
    await ADMIN.findByIdAndUpdate(
      admin_id,
      {
        fullName: fullName,
        phone: phone,
        postion: postion,
        institute: institute,
        major: major,
      },
      { new: true },

      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: "Database Update Failure",
          });
        } else {


       
        console.log("This is the Response: " + response);
       
        res.redirect("profile");


        }
        req.session.user = response;
      }
    );
  } catch (error) {
    res.json(error);
  }
});


function ensureAdmin(req, res, next) {
  if (req.session.user.type === "Admin") {
    next();
  } else {
    res.redirect(req.get("referer"));
  }
}

module.exports = route;

var express = require("express");
const route = express.Router();
const USER = require("../models/User");
const CHAIRPERSON = require("../models/Chairperson");
const EXAMINFORMATION = require("../models/ExamInformation");
const EXAMINER = require("../models/Examiner");
const STUDENT = require("../models/Student");
const SUPERVISOR = require("../models/Supervisor");
const ADMIN = require("../models/Admin");
const multer = require("multer");
const path = require("path");
const Swal = require("sweetalert2");
const { ensureAuth } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

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
route.get("/adminHome", ensureAuth, ensureAdmin, (req, res) => {
  res.render("adminHome", {
    user: req.session.user,
  });
});

route.get("/dashboard", ensureAuth, ensureAdmin, async (req, res, next) => {
  console.log("The uadmin session info: ", req.session.user);

  res.render("Admin/adminHome", {
    user: req.session.user,
    layout: "mainAdmin",
  });
});
route.get("/Home", ensureAuth, ensureAdmin, async (req, res, next) => {
  let admin = req.session.user;

  res.render("Admin/adminHome", {
    user: admin,
    layout: "mainAdmin",
  });
});
route.get("/profile", ensureAuth, ensureAdmin, async (req, res, next) => {
  const { ...rest } = req.session.user;
  console.log("rest", rest);

  console.log("req.file", req.file);
  res.render("Admin/profile", {
    user: req.session.user,
    layout: "mainAdmin",
  });
});
route.get("/editinfo", ensureAuth, ensureAdmin, (req, res, next) => {
  res.render("Admin/editinfo", {
    user: req.session.user,
    layout: "mainAdmin",
  });
});

route.get("/manageUsers", async (req, res) => {
  const admins = await ADMIN.find({}).lean();
  const examiners = await EXAMINER.find({}).lean();
  const students = await STUDENT.find({}).lean();
  const supervisors = await SUPERVISOR.find({}).lean();
  const chairpeople = await CHAIRPERSON.find({}).lean();

  //res.json(users);
  let totalSupervisors;
  let totalStudents;
  let totalExaminers;

  console.log("Num of Supervisors: ", supervisors.length);

  res.render("Admin/Dashboard", {
    user: req.session.user,
    supervisors: supervisors,
    students: students,
    examiners: examiners,
    admins: admins,
    chairpeople: chairpeople,
    layout: "mainAdmin",
  });
});

route.get("/delete/:id", ensureAuth, ensureAdmin, async (req, res) => {
  const user = await USER.findOne({
    userId: req.params.id,
  });
  const user1 = await EXAMINER.findOne({
    _id: req.params.id,
  });
  const user2 = await CHAIRPERSON.findOne({
    _id: req.params.id,
  });
  const user3 = await SUPERVISOR.findOne({
    _id: req.params.id,
  });
  const user4 = await ADMIN.findOne({
    _id: req.params.id,
  });
  const user5 = await STUDENT.findOne({
    _id: req.params.id,
  });

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
    case "Student":
      if (user5) {
        console.log("great");

        await STUDENT.findByIdAndDelete(user5);
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

  res.redirect("/Admin/Manageusers");
});

route.get("/view/:id", ensureAuth, ensureAdmin, async (req, res) => {
  console.log("id: ", req.params.id);

  const { id } = req.params;
  console.log("log", id);

  try {
    var user = await USER.findOne({
      userId: id,
    });
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

route.get("/AdminSignup", (req, res) => {
  res.redirect("/Admin/Manageusers");
});

//add student
route.get(
  "/AssignStudents",
  ensureAuth,
  ensureAdmin,
  async (req, res, next) => {
    const allSupervisors = await SUPERVISOR.find({}).lean();
    const allStudents = await STUDENT.find({}).lean();
    console.log("allStudents", allStudents);

    res.render("Admin/AssignStudents", {
      user: req.session.user,
      allSupervisors,
      allStudents,
      layout: "mainAdmin",
    });
  }
);

route.get("/issueExam", ensureAuth, ensureAdmin, async (req, res, next) => {
  const allSupervisors = await SUPERVISOR.find({}).lean();
  const allStudents = await STUDENT.find({}).lean();
  const allexaminers = await EXAMINER.find({}).lean();
  const chairpeople = await CHAIRPERSON.find({}).lean();

  res.render("Admin/registerExam", {
    user: req.session.user,
    allSupervisors,
    allStudents,
    allexaminers,
    chairpeople,
    layout: "mainAdmin",
  });
});
route.post("/AdminSignup", ensureAuth, ensureAdmin, async (req, res) => {
  const {
    type,
    email,
    password: plainTextPassword,
    fullName,
    major,
    phone,
    matricNo,
  } = req.body;

  let response_Supervisor = "";
  let response_Student = "";
  let response_Examiner = "";
  let response_Chairperson = "";
  let response_Admin = "";

  const password = await bcrypt.hash(plainTextPassword, 7);

  try {
    console.log("inside try");
    console.log("The type is ??? :", type);

    switch (type) {
      case "Admin":
        if (req.session.user.type === "Admin") {
          let data = {
            fullName,
            major,
            phone,
            email,
          };
          response_Admin = await ADMIN.create(data);

          let admin_Data = {
            type,
            email,
            password,
          };

          admin_Data.userId = response_Admin._id;
          response_Admin = await USER.create(admin_Data);
        }
        break;

      case "Supervisor":
        let data = {
          fullName,
          major,
          phone,
          email,
        };
        data.staffNo = matricNo;
        response_Supervisor = await SUPERVISOR.create(data);

        let user_Data = {
          type,
          email,
          password,
        };

        user_Data.userId = response_Supervisor._id;
        response_Supervisor = await USER.create(user_Data);
        break;

      case "Chairperson":
        console.log("inside case chair");

        let Chairdata = {
          fullName,
          major,
          phone,
          email,
        };
        Chairdata.staffNo = matricNo;
        response_Chairperson = await CHAIRPERSON.create(Chairdata);

        let user_CData = {
          type,
          email,
          password,
        };

        user_CData.userId = response_Chairperson._id;
        response_Chairperson = await USER.create(user_CData);

        console.log("user_CData", user_CData);

        break;
      case "Student":
        let studentData = {
          fullName,
          major,
          phone,
          matricNo,
          email,
        };

        response_Student = await STUDENT.create(studentData);

        let temp_data = {
          email,
          password,
          type,
        };
        temp_data.userId = response_Student._id;

        response_Student = await USER.create(temp_data);

        break;
      case "Examiner":
        let Ex_data = {
          fullName,
          major,
          phone,
          email,
        };
        Ex_data.staffNo = matricNo;

        response_Examiner = await EXAMINER.create(Ex_data);

        let Ex_user_Data = {
          type,
          email,
          password,
        };

        Ex_user_Data.userId = response_Examiner._id;
        response_Examiner = await USER.create(Ex_user_Data);

        break;

      default:
        break;
    }

    console.log("User created successfully: ", response_Chairperson);
    //alert('User is created successfully')
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({
        status: "error",
        error: "Email already in use",
      });
    }
    throw error;
  }
  if (req.session.user.type === "Admin") {
    res.redirect("/Admin/Manageusers");
  } else {
    {
      console.log("req.session.user_id: ?", req.session.user);

      res.redirect("login");
    }
  }
});

route.post(
  "/profile",
  ensureAuth,
  ensureAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await ADMIN.findByIdAndUpdate(
        req.session.user._id,
        {
          image: req.file.filename,
        },
        {
          new: true,
        },

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
        }
      );
    } catch (error) {
      res.json(error);
    }
  }
);

route.post("/editinfo", ensureAuth, ensureAdmin, async (req, res, next) => {
  const { fullName, phone, postion, institute, major } = req.body;

  //console.log("The request :", req.body);
  var admin_id = req.session.user._id;
  console.log("admin_id: ", admin_id);

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
      {
        new: true,
      },

      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: "Database Update Failure",
          });
        } else {
          console.log("This is the Response: " + response);
          response.type = req.session.user.type;
          req.session.user = response;
        }
        res.redirect("profile");
      }
    );
  } catch (error) {
    res.json(error);
  }
});

//add student post
route.post(
  "/assignStudents",
  ensureAuth,
  ensureAdmin,
  async (req, res, next) => {
    const allSupervisors = await SUPERVISOR.find({}).lean();
    const allStudents = await STUDENT.find({}).lean();
    selectedInPage = req.body;

    console.log("selectedInPage", selectedInPage);
    console.log("selectedStudent: ", selectedInPage.supervisor);
    console.log("selectedSuperviso: ", selectedInPage.student);

    try {
      allStudents.forEach(async function (stu) {
        console.log("stu._id  ", stu._id);
        console.log("selectedInPage.student ", selectedInPage.student);

        if (stu._id == selectedInPage.student) {
          console.log("wardan");
          console.log("i choose this:", stu.matricNo);

          await STUDENT.findByIdAndUpdate(
            selectedInPage.student,
            {
              supervisorId: selectedInPage.supervisor,
            },
            {
              new: true,
            },

            function (err, response) {
              // Handle any possible database errors
              if (err) {
                console.log("we hit an error" + err);
                res.json({
                  message: "Database Update Failure",
                });
              }
              console.log("This is the Response: " + response);
            }
          );
        }
      });

      res.redirect("assignStudents");
    } catch (error) {
      res.json(error);
    }
  }
);

route.post("/issueExam", ensureAuth, ensureAdmin, async (req, res, next) => {
  const supervisor = await SUPERVISOR.findOne({}).lean();

  const Student = await STUDENT.find({}).lean();
  const examiner = await EXAMINER.find({}).lean();
  const chair = await CHAIRPERSON.find({}).lean();

  selectedInPage = req.body;

  console.log("selectedInPage", selectedInPage);
  console.log("selected SV: ", selectedInPage.supervisor);
  console.log("selected ST: ", selectedInPage.student);
  console.log("selected EX1: ", selectedInPage.examiner1);
  console.log("selected Ex2: ", selectedInPage.examiner2);
  console.log("selected ChR: ", selectedInPage.chairperson);
  console.log("Exam date: ", selectedInPage.date);
  console.log("Time  : ", selectedInPage.time);
  console.log("Venue  : ", selectedInPage.venue);
  console.log("selected ST 1: ", selectedInPage.student.examinerOneApproved);
  console.log("selected ST 2: ", selectedInPage.student.examinerTwoApproved);
  console.log("selected ST CH: ", selectedInPage.student.chairPersonApproved);

  try { 
    let exam ={
      supervisor,
      examiner1,examiner2,chairperson,student,date, time,venue
    }; 
    let exam_response = await  EXAMINFORMATION.create(exam);
    
    res.redirect("issueExam");
  } catch (error) {
    res.json(error)
  }
});

module.exports = route;

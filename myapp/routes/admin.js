var express = require("express");
const route = express.Router();
const USER = require("../models/User");
const CHAIRPERSON = require("../models/Chairperson");
const EXAMINFORMATION = require("../models/ExamInformation");
const EXAMINER = require("../models/Examiner");
const STUDENT = require("../models/Student");
const SUPERVISOR = require("../models/Supervisor");
const ADMIN = require("../models/Admin");
const RESULT = require("../models/Result");
const multer = require("multer");
const path = require("path");
const Swal = require("sweetalert2");
const { ensureAuth } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "documentvivasystem@gmail.com",
    pass: "M1234mras",
  },
});

const mailOptions = {
  from: "documentvivasystem@gmail.com", // sender address
  to: "", // list of receivers
  subject: "Student Oral Examination (VIVA) details", // Subject line
  html: "", // plain text body
};
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
  const allStudents = await STUDENT.find({}).lean();


  res.render("Admin/registerExam", {
    user: req.session.user,
    allStudents,
    layout: "mainAdmin",
  });
});

route.get(
  "/StudentInfo/:id",
  ensureAuth,
  ensureAdmin,
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const student = await STUDENT.findById(id)
        .lean()
        .populate("supervisorId")
        .populate("examinerOneId")
        .populate("examinerTwoId")
        .populate("chairPersonId");
      console.log(student);
      let json = {};
      json.supervisorName =
        student.supervisorId != undefined
          ? student.supervisorId.fullName
          : "None";
      json.examinerOneName =
        student.examinerOneId != undefined
          ? student.examinerOneId.fullName
          : "None";
      json.examinerTwoName =
        student.examinerTwoId != undefined
          ? student.examinerTwoId.fullName
          : "None";
      json.chairpersonName =
        student.chairPersonId != undefined
          ? student.chairPersonId.fullName
          : "None";
      res.json(json);
    } catch (error) {
      res.json(error);
    }
  }
);

route.get(
  "/students",
  ensureAuth,
  ensureAdmin,
  async (req, res, next) => {

    try {
      const students = await STUDENT.find({})
        .lean()

      console.log("student: ", students);

      res.render("Admin/students", {
        user: req.session.user,
        students,
        layout: "mainAdmin",
      });


    } catch (error) {
      res.json(error);
    }
  }
);

route.get(
  "/ShowStudentInfo/:id",
  ensureAuth,
  ensureAdmin,
  async (req, res, next) => {

    let stuID = req.params.id;

    const student = await STUDENT.findById(stuID).lean()
      .populate("supervisorId")
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("chairPersonId");

    console.log("student: ", student);

    chairId = student.chairPersonId._id;
    EX1Id = student.examinerOneId._id;
    EX2Id = student.examinerTwoId._id;

    const examInfo = await EXAMINFORMATION.findOne({
      studentId:stuID,
    }).lean();

    console.log("examInfo:", examInfo);


    const finalChairResult = await RESULT.findOne({
      studentId: stuID,
      reviewerId: chairId,
    }).lean();

    const finalExaminerOneResult = await RESULT.findOne({
      studentId: stuID,
      reviewerId: EX1Id,
    }).lean();

    const finalExaminerTwoResult = await RESULT.findOne({
      studentId: stuID,
      reviewerId: EX2Id,
    }).lean();



    res.render("Admin/showStudentInfo", {
      user: req.session.user,
      student, finalChairResult, finalExaminerOneResult, finalExaminerTwoResult, examInfo,
      layout: "mainAdmin",
    });
  }
);

route.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
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
  console.log(req.body);

  const student = await STUDENT.findById(req.body.studentId)
    .lean()
    .populate("supervisorId")
    .populate("examinerOneId")
    .populate("examinerTwoId")
    .populate("chairPersonId");

  const thereIsExam = await EXAMINFORMATION.find({
    studentId: student._id,
  }).lean();

  console.log('thereIsExam: ', thereIsExam.length);


  if (thereIsExam.length == 0) {
    try {
      //if there is an exam from before the
      if (student.supervisorId == undefined) {
        res.send("The Student has not been assigned a Supervisor");
      }

      if (student.chairPersonId == undefined) {
        res.send("The Student has not been assigned a chairPerson");
      }
      if (student.examinerOneId == undefined) {
        res.send("The Student has not been assigned an examiner One");
      }
      if (student.examinerTwoId == undefined) {
        res.send("The Student has not been assigned an examiner Two");
      }
      if (student.chairPersonApproved === false) {
        res.send("The Chairperson has not approved yet");
      }
      if (student.examinerOneApproved === false) {
        res.send("The examiner One  has not approved yet");
      }
      if (student.examinerTwoApproved === false) {
        res.send("The examiner Two has not approved yet");
      }

      console.log("student.chairPersonId: ", student.chairPersonId);
      console.log("student.examinerOneId: ", student.examinerOneId);
      console.log("student.examinerTwoId: ", student.examinerTwoId);
      
      req.body.supervisorId = student.supervisorId;
      req.body.examinerOneId = student.examinerOneId;
      req.body.examinerTwoId = student.examinerTwoId;
      req.body.chairPersonId = student.chairPersonId;

      let exam_response = await EXAMINFORMATION.create(req.body);
      console.log('student.fullName: ', student.fullName);
      console.log('examDate: ', req.body.examDate);
      console.log('time: ', req.body.time);
      console.log('venue: ', req.body.venue);

      mailOptions.to = student.supervisorId.email;
      mailOptions.to = student.chairPersonId.email;
      mailOptions.to = student.examinerOneId.email;
      mailOptions.to = student.examinerTwoId.email;

      mailOptions.html = ` 
        Dear Sir/Madam, <br><br>
      Please be notified that the Examination information for the student: ${student.fullName} has been issued as followed: <br> 
      Date: <strong>${req.body.examDate} </strong> <br> 
      Time: <strong>${req.body.time}</strong> <br> 
      Venue: <strong>${req.body.venue}</strong> <br> <br>
      
      Thank you! 
      `;

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });

      res.redirect("issueExam");
    } catch (error) {
      res.json(error);
    }

  } else {
    res.send('Already booked')
  }


});

module.exports = route;

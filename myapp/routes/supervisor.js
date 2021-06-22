var express = require("express");
const route = express.Router();
const STUDENT = require("../models/Student");
const SUPERVISOR = require("../models/Supervisor");
const EXAMINER = require("../models/Examiner");
const CHAIRPERSON = require("../models/Chairperson");
const DOCUMENT = require("../models/Document");
const EXAMINFORMATION = require("../models/ExamInformation");
const RESULT = require("../models/Result");
const multer = require("multer");
const path = require("path");
var nodemailer = require("nodemailer");
const formidable = require("formidable");
var fs = require("fs");
const csrf = require("csurf");

const { ensureAuth, ensureSupervisor } = require("../middleware/auth");

const csrfProtection = csrf();

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
  subject: "Viva Oral Examination", // Subject line
  html: "", // plain text body
};

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

//dashboard-no route
route.get("/", ensureAuth, ensureSupervisor, async (req, res, next) => {
  res.render("Supervisor/Dashboard", {
    user: req.session.user,
    layout: "mainSV.hbs",
  });
});
//dashboard
route.get(
  "/dashboard",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    res.render("Supervisor/Dashboard", {
      user: req.session.user,
      layout: "mainSV.hbs",
    });
    //res.json(req.session.user);

    //  console.log('User Name from session : ', user.fullName );
  }
);
//home page
route.get("/home", ensureAuth, ensureSupervisor, (req, res, next) => {
  res.render("Supervisor/Dashboard", {
    user: req.session.user,
    layout: "mainSV.hbs",
  });
});
//profile page
route.get(
  "/profile",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  (req, res, next) => {
    res.render("Supervisor/profile", {
      user: req.session.user,
      csrfToken: req.csrfToken(),
      layout: "mainSV.hbs",
    });
  }
);
//students page
route.get("/students", ensureAuth, ensureSupervisor, async (req, res, next) => {
 
  try {
    const allstudents = await STUDENT.find({
      supervisorId: req.session.user._id,
    })
      .lean()
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("chairPersonId");


    res.render("Supervisor/students", {
      students: allstudents,
      user: req.session.user,
      layout: "mainSV.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});


route.get(
  "/examinersInformation",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    try {
      const allexaminers = await EXAMINER.find({}).lean();

      console.log("THE STUDENT INFORMATION: ", allexaminers);

      res.render("Supervisor/examinerInfo", {
        examiners: allexaminers,
        user: req.session.user,
        layout: "mainSV.hbs",
      });
    } catch (error) {
      res.json(error);
    }
  }
);

route.get("/examInfo", ensureAuth, ensureSupervisor, async (req, res, next) => {
  try {
    var allstudents = await STUDENT.find({
      supervisorId: req.session.user._id,
    }).lean();

    res.render("Supervisor/vivaExam", {
      students: allstudents,
      user: req.session.user,
      layout: "mainSV.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});

//edit info page
route.get("/editinfo", ensureAuth, ensureSupervisor,   csrfProtection,
(req, res, next) => {
  res.render("Supervisor/editinfo", {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    layout: "mainSV.hbs",
  });
});
//add student
route.get(
  "/addStudent",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  async (req, res, next) => {
    const students = await STUDENT.find({}).lean();
    res.render("Supervisor/students", {
      user: req.session.user,
      csrfToken: req.csrfToken(),
      students: students,
      layout: false,
    });
  }
);
//manage examiners
route.get(
  "/manageExaminers",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  async (req, res, next) => {
    res.render("Supervisor/examinersSelection", {
      user: req.session.user,
      csrfToken: req.csrfToken(),
      layout: "mainSV.hbs",
    });
  }
);
//students documents
route.get(
  "/studentDoc",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  async (req, res, next) => {
    try {
      var allstudents = await STUDENT.find({
        supervisorId: req.session.user._id,
      }).lean();
      //var doc = await DOCUMENT.findOne({ studentId: allstudents._id }).lean();

      //console.log("doc it is", doc);

      console.log("THE STUDENT INFORMATION: ", allstudents);

      res.render("Supervisor/document", {
        students: allstudents,
        user: req.session.user,
        csrfToken: req.csrfToken(),
        layout: "mainSV.hbs",
      });
    } catch (error) {
      res.json(error);
    }
  }
);

//show students documents
route.get(
  "/showDocument/:id",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    console.log("id:", req.params.id);

    try {
      const stu = await STUDENT.findOne({
        _id: req.params.id,
      }).lean();
      const doc = await DOCUMENT.find({
        studentId: stu._id,
      }).lean();
      console.log("The student is: ", stu.fullName);
      console.log("The doc is: ", doc);

      res.render("Supervisor/showDocument", {
        user: req.session.user,
        stu,
        doc,
        layout: "mainSV.hbs",
      });
    } catch (error) {
      res.json(error);
    }
  }
);

//show students documents
route.get(
  "/examResults",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    try {
      var allstudents = await STUDENT.find({
        supervisorId: req.session.user._id,
      }).lean();

      res.render("Supervisor/studentResult", {
        students: allstudents,
        user: req.session.user,
        layout: "mainSV.hbs",
      });
    } catch (error) {
      res.json(error);
    }
  }
);

route.get(
  "/vivaExamInfo/:id",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    console.log("id:", req.params.id);

    try {
      const stu = await STUDENT.findOne({
        _id: req.params.id,
      })
        .lean()
        .populate("examinerOneId")
        .populate("examinerTwoId")
        .populate("chairPersonId");

      const examInfo = await EXAMINFORMATION.findOne({
        studentId: stu._id,
      }).lean();

      console.log("The student is: ", stu.examinerOneId);
      console.log("The exam info is: ", examInfo);

      res.render("Supervisor/vivaExamInfo", {
        user: req.session.user,
        stu,
        examInfo,
        layout: "mainSV.hbs",
      });
    } catch (error) {
      res.json(error);
    }
  }
);

route.get(
  "/viewExamResult/:id",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  async (req, res, next) => {

    try {

      console.log("stId:", req.params.id);

      let studentId = req.params.id;
  
      const student = await STUDENT.findById(studentId)
        .lean()
        .populate("examinerOneId")
        .populate("examinerTwoId")
        .populate("chairPersonId");
      console.log("student: ", student);
  
      // if(student.chairPersonId == null)
      // {
      //   res.send("No chair");
      // } else if(student.examinerOneId == null){
      //   res.send("No ex1");
      // } else if(student.examinerTwoId == null){
      //   res.send("no ex2");
      // }
  
      chairId = student.chairPersonId._id;
      EX1Id = student.examinerOneId._id;
      EX2Id = student.examinerTwoId._id;
      console.log("chairId", chairId);
  
      const finalChairResult = await RESULT.findOne({
        studentId: student._id,
        reviewerId: chairId,
      }).lean();
      const finalExaminerOneResult = await RESULT.findOne({
        studentId: studentId,
        reviewerId: EX1Id,
      }).lean();
      const finalExaminerTwoResult = await RESULT.findOne({
        studentId: studentId,
        reviewerId: EX2Id,
      }).lean();
      
      // if(finalChairResult == null)
      // {
      //  return res.send("No chair result");
      // } 
      // if(finalExaminerOneResult == null)
      // {
      //  return res.send("No chair result");
      // } 
      // if(finalExaminerTwoResult == null)
      // {
      //  return res.send("No chair result");
      //} 
  
  
      res.render("Supervisor/showStudentResult", {
        user: req.session.user,
        csrfToken: req.csrfToken(),
        student,
        finalChairResult,
        finalExaminerOneResult,
        finalExaminerTwoResult,
        layout: "mainSV.hbs",
      });
    } catch (error) {

      res.json(error)
      
    }
  
  });
route.post(
  "/studentDoc",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    var student = await STUDENT.findOne({
      matricNo: req.body.matricNo,
    }).lean();

    try {
      var doc = await DOCUMENT.findOne({
        studentId: student._id,
      }).lean();
    } catch (error) {
      res.json(error);
    }

  }
);

//chose
route.get("/choose", ensureAuth, ensureSupervisor,  csrfProtection, async (req, res, next) => {
  const { id, email } = req.query;
  // const id = req.params.id;
  console.log(email);

  try {
    const student = await STUDENT.findById(id)
      .lean()
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("chairPersonId");
    console.log("student is: ?", student);
    const examiners = await EXAMINER.find({}).lean();
    const chairpersons = await CHAIRPERSON.find({}).lean();

    // console.log("The student is:", student);
    // console.log('EXAMINERS :',examiners);
    // console.log('CHAIR :',chairperson);

    if (student) {
      res.render("Supervisor/choose", {
        student: student,
        examiners: examiners,
        chairPersons: chairpersons,
        user: req.session.user,
        csrfToken: req.csrfToken(),
        layout: "mainSV.hbs",
      });
    } else {
      res.send("Not Found");
    }
  } catch (error) {
    res.json(error);
  }

  //------
});

//delete student
route.get(
  "/deleteStudent/:id",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  async (req, res, next) => {
    console.log("id:", req.params.id);

    try {
      stu = await STUDENT.find({
        _id: req.params.id,
      }).lean();

      await STUDENT.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            supervisorId: null,
            chairPersonId: null,
            examinerOneId: null,
            examinerTwoId: null,
          },
        }
      );
    } catch (error) {
      res.json(error);
    }

    // console.log(stu);
    //if()
    // res.json(stu);
    res.redirect("/Supervisor/students");
  }
);

//student's viva documents
// route.post("/documents", function (request, result) {
//   var formData = new formidable.IncomingForm();
//   formData.parse(request, function (error, fields, files) {
//     var extension = files.file.name.substr(files.file.name.lastIndexOf("."));
//     var newPath = "./uploads/" + fields.fileName + extension;
//     fs.rename(files.file.path, newPath, function (errorRename) {
//       result.send("File saved = " + newPath);
//     });
//   });
// });

//profile page
route.post(
  "/profile",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  upload.single("image"),
  async (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);

    await SUPERVISOR.findByIdAndUpdate(
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
        res.redirect("/Supervisor/profile");
        console.log("This is the Response: " + response);
      }
    );
  }
);
//edit info post
route.post(
  "/editinfo",
  ensureAuth,
  ensureSupervisor,
  csrfProtection,
  async (req, res, next) => {
    const { fullName, phone, postion, institute, major } = req.body;

    // console.log("The user information: "+req.session.user);
    console.log("The request file:", req.file);

    try {
      await SUPERVISOR.findByIdAndUpdate(
        req.session.user._id,
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
          }
          req.session.user = response;

          res.redirect("profile");
          console.log("This is the Response: " + response);
        }
      );
    } catch (error) {
      res.json(error);
    }
  }
);

//choose post
route.post("/choose", ensureAuth, ensureSupervisor,  csrfProtection,
async (req, res, next) => {
  console.log(req.body);
  const { matricNo, examinerOneId, examinerTwoId, chairPersonId } = req.body;

  const student = await STUDENT.findOne({
    matricNo: matricNo,
  }).lean();
  console.log("What info: ", student);

  try {
    if (chairPersonId == "null") {
      await STUDENT.findByIdAndUpdate(
        student._id,
        {
          new: true,
          $unset: {
            chairPersonId: 1,
            chairPersonApproved: 1,
          },
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

          // res.redirect('students')
        }
      );
    } else {
      await STUDENT.findByIdAndUpdate(
        student._id,
        {
          chairPersonId: chairPersonId,
          chairPersonApproved: false,
          submittedDate: Date.now(),
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
    if (examinerOneId == "null") {
      await STUDENT.findByIdAndUpdate(
        student._id,
        {
          new: true,
          $unset: {
            examinerOneId: 1,
            examinerOneApproved: 1,
          },
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

          // res.redirect('students')
        }
      );
    } else {
      const Examiner1 = await EXAMINER.findById(examinerOneId).lean();

      await STUDENT.findByIdAndUpdate(
        student._id,
        {
          examinerOneId: examinerOneId,
          examinerOneApproved: false,
          submittedDate: Date.now(),
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
          mailOptions.to = Examiner1.email;
          mailOptions.html = ` 
          Please be notified that the supervisor Dr. ${req.session.user.fullName} has choosen you to be the Examiner for the student ${student.fullName}. Thank you! 
          `;

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) console.log(err);
            else console.log(info);
          });
          console.log("This is the Response: " + response);
        }
      );
    }
    if (examinerTwoId == "null") {
      await STUDENT.findByIdAndUpdate(
        student._id,
        {
          new: true,
          $unset: {
            examinerTwoId: 1,
            examinerTwoApproved: 1,
          },
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

          // res.redirect('students')
        }
      );
    } else {
      const Examiner2 = await EXAMINER.findById(examinerTwoId).lean();

      await STUDENT.findByIdAndUpdate(
        student._id,
        {
          examinerTwoId: examinerTwoId,
          examinerTwoApproved: false,
          submittedDate: Date.now(),
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

          mailOptions.to = Examiner2.email;
          mailOptions.html = ` 
          Please be notified that the supervisor Dr. ${req.session.user.fullName} has choosen you to be the Examiner for the student Mohammed Wardan. Thank you! 
          `;

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) console.log(err);
            else console.log(info);
          });
          console.log("This is the Response: " + response);
        }
      );
    }

    res.redirect("students");
  } catch (error) {
    res.json(error);
  }
});

module.exports = route;

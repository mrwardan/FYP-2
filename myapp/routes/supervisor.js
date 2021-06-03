var express = require("express");
const route = express.Router();
const STUDENT = require("../models/Student");
const SUPERVISOR = require("../models/Supervisor");
const EXAMINER = require("../models/Examiner");
const CHAIRPERSON = require("../models/Chairperson");
const DOCUMENT = require("../models/Document");
const multer = require("multer");
const path = require("path");
const {
  findById
} = require("../models/Student");
const Swal = require("sweetalert2");
const formidable = require("formidable");
var fs = require("fs");
const {
  ensureAuth
} = require("../middleware/auth");

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

//dashboard-no route
route.get("/", ensureAuth, ensureSupervisor, async (req, res, next) => {
  res.render("Supervisor/Dashboard", {
    user: req.session.user,
    layout: "mainSV.hbs",
  });
  //res.json(req.session.user);

  //  console.log('User Name from session : ', user.fullName );
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
route.get("/profile", ensureAuth, ensureSupervisor, (req, res, next) => {
  res.render("Supervisor/profile", {
    user: req.session.user,
    layout: "mainSV.hbs",
  });
});
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

    // i tried chairpeople it did work but gives the id instead of the name

    //  // await allstudents.populate("chairPersonId");
    //   await allstudents.populate("ExaminerOneId").execPopulate();
    //   await allstudents.populate("ExaminerTwoId").execPopulate();

    //console.log('asdfghjhgfdsa');
    //console.log(allstudents);
    console.log("THE STUDENT INFORMATION: ", allstudents);

    res.render("Supervisor/students", {
      students: allstudents,
      user: req.session.user,
      layout: "mainSV.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});
//edit info page
route.get("/editinfo", ensureAuth, ensureSupervisor, (req, res, next) => {
  res.render("Supervisor/editinfo", {
    user: req.session.user,
    layout: "mainSV.hbs",
  });
});
//add student
route.get(
  "/addStudent",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    const students = await STUDENT.find({}).lean();
    res.render("Supervisor/students", {
      user: req.session.user,
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
  async (req, res, next) => {
    res.render("Supervisor/examinersSelection", {
      user: req.session.user,
      layout: "mainSV.hbs",
    });
  }
);
//students documents
route.get("/studentDoc", ensureAuth, ensureSupervisor, async (req, res, next) => {

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
      layout: "mainSV.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});

//show students documents
route.get("/showDocument/:id", ensureAuth, ensureSupervisor, async (req, res, next) => {

  console.log("id:", req.params.id);

  try {
    const stu = await STUDENT.findOne({
      _id: req.params.id
    }).lean();
    const doc = await DOCUMENT.find({
      studentId: stu._id
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

});





route.post(
  "/studentDoc",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    var student = await STUDENT.findOne({
      matricNo: req.body.matricNo
    }).lean();
    // console.log("The student is: ", student);
    //console.log("The student Id is: ", student);

    try {
      var doc = await DOCUMENT.findOne({
        studentId: student._id
      }).lean();
      //console.log('doc:', doc.documentName);
    } catch (error) {
      res.json(error);
    }
    //  re.json(doc)
    // res.redirect("studentDocuments");
  }
);

//chose
route.get("/choose", ensureAuth, ensureSupervisor, async (req, res, next) => {
  const {
    id
  } = req.query;
  // const id = req.params.id;
  console.log('wardan');

  try {
    const student = await STUDENT.findById(id)
      .lean()
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("chairpeople");
    console.log("student is: ?", student);
    const examiners = await EXAMINER.find({}).lean();
    const chairperson = await CHAIRPERSON.find({}).lean();

    // console.log("The student is:", student);
    // console.log('EXAMINERS :',examiners);
    // console.log('CHAIR :',chairperson);

    if (student) {
      res.render("Supervisor/choose", {
        student: student,
        examiners: examiners,
        chairpeople: chairperson,
        user: req.session.user,
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
//sign out
route.get("/signout", (req, res, next) => {
  req.session.destroy();
  res.render("login", {
    layout: false
  });
});

//delete student
route.get(
  "/deleteStudent/:id",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    console.log("id:", req.params.id);

    try {
      stu = await STUDENT.find({
        _id: req.params.id
      }).lean();

      await STUDENT.updateOne({
        _id: req.params.id
      }, {
        $set: {
          supervisorId: null
        }
      });
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
route.post("/documents", function (request, result) {
  var formData = new formidable.IncomingForm();
  formData.parse(request, function (error, fields, files) {
    var extension = files.file.name.substr(files.file.name.lastIndexOf("."));
    var newPath = "./uploads/" + fields.fileName + extension;
    fs.rename(files.file.path, newPath, function (errorRename) {
      result.send("File saved = " + newPath);
    });
  });
});

//profile page
route.post(
  "/profile",
  ensureAuth,
  ensureSupervisor,
  upload.single("image"),
  async (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);

    await SUPERVISOR.findByIdAndUpdate(
      req.session.user._id, {
        image: req.file.filename
      }, {
        new: true
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
  }
);
//edit info post
route.post(
  "/editinfo",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    const {
      fullName,
      phone,
      postion,
      institute,
      major
    } = req.body;

    // console.log("The user information: "+req.session.user);
    console.log("The request file:", req.file);

    try {
      await SUPERVISOR.findByIdAndUpdate(
        req.session.user._id, {
          fullName: fullName,
          phone: phone,
          postion: postion,
          institute: institute,
          major: major,
        }, {
          new: true
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
//add student post
route.post(
  "/addStudent",
  ensureAuth,
  ensureSupervisor,
  async (req, res, next) => {
    const {
      matricNo
    } = req.body;

    try {
      const student = await STUDENT.findOne({
        matricNo: matricNo
      }).lean();

      if (!student) {
        res.send("Matric was not found");
      }

      await STUDENT.findByIdAndUpdate(
        student._id, {
          supervisorId: req.session.user._id
        }, {
          new: true
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

      res.redirect("students");
    } catch (error) {}
  }
);
//choose post
route.post("/choose", ensureAuth, ensureSupervisor, async (req, res, next) => {
  const {
    matricNo,
    examinerOneId,
    examinerTwoId,
    chairPersonId
  } = req.body;
  const student = await STUDENT.findOne({
    matricNo: matricNo
  }).lean();
  console.log("What info: ", student);

  try {
    if (chairPersonId == "null") {
      await STUDENT.findByIdAndUpdate(
        student._id, {
          new: true,
          $unset: {
            chairPersonId: 1
          }
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
        student._id, {
          chairPersonId: chairPersonId,
          chairPersonApproved: false,
          submittedDate: Date.now(),
        }, {
          new: true
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
        student._id, {
          new: true,
          $unset: {
            examinerOneId: 1
          }
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
        student._id, {
          examinerOneId: examinerOneId,
          examinerOneApproved: false,
          submittedDate: Date.now(),
        }, {
          new: true
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
    if (examinerTwoId == "null") {
      await STUDENT.findByIdAndUpdate(
        student._id, {
          new: true,
          $unset: {
            examinerTwoId: 1
          }
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
        student._id, {
          examinerTwoId: examinerTwoId,
          examinerTwoApproved: false,
          submittedDate: Date.now(),
        }, {
          new: true
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



    res.redirect("students");
  } catch (error) {
    res.json(error);
  }
});

function ensureSupervisor(req, res, next) {
  const secret = req.session.user.Auth;
  if (secret === "SupAuth_$") {
    next();
  } else {
    res.redirect(req.get("referer"));
  }
}

module.exports = route;
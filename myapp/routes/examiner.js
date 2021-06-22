var express = require("express");
const route = express.Router();
const EXAMINER = require("../models/Examiner");
const STUDENT = require("../models/Student");
const EXAMINFORMATION = require("../models/ExamInformation");
const RESULT = require("../models/Result");
const multer = require("multer");
const path = require("path");
const { ensureAuth,ensureExaminer } = require("../middleware/auth");
const csrf = require("csurf");
const csrfProtection = csrf();
route.use(csrfProtection)

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

route.get("/", ensureAuth,ensureExaminer, async (req, res, next) => {
  // res.json(user);
  res.render("Examiner/Dashboard", {
    user: req.session.user,
    layout: "mainEX.hbs",
  });
});
route.get("/dashboard", ensureAuth,ensureExaminer,csrfProtection, async (req, res, next) => {
  //res.json(user);

  res.render("Examiner/Dashboard", {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    layout: "mainEX.hbs",
  });
});

route.get("/home", ensureAuth,ensureExaminer,csrfProtection, (req, res, next) => {
  res.render("Examiner/Dashboard", {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    layout: "mainEx.hbs",
  });
});
route.get("/profile", ensureAuth,ensureExaminer,csrfProtection, (req, res, next) => {
  res.render("Examiner/profile", {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    layout: "mainEx.hbs",
  });
});

route.get("/editinfo", ensureAuth,ensureExaminer,csrfProtection, (req, res, next) => {
  res.render("Examiner/editinfo", {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    layout: "mainEx.hbs",
  });
});
route.get("/approve", ensureAuth,ensureExaminer,csrfProtection, async (req, res, next) => {
  try {
    let pending = [];
    let approved = [];
    let rejected = [];

    const students = await STUDENT.find({
      $or: [
        {
          examinerOneId: req.session.user._id,
        },
        {
          examinerTwoId: req.session.user._id,
        },
      ],
    })
      .lean()
      .populate("supervisorId");

    students.forEach((s) => {

      console.log("s.examinerOneId", s.examinerOneId);


      if (s.examinerOneId == req.session.user._id) {

        if (s.examinerOneReject) {
          rejected.push(s);
        }
        if (s.examinerOneApproved) {
          approved.push(s);
        }

        if (!s.examinerOneApproved && !s.examinerOneReject) {
          pending.push(s);
        }
      }else{

        if (s.examinerTwoReject) {
          rejected.push(s);
        }
        if (s.examinerTwoApproved) {
          approved.push(s);
        }

        if (!s.examinerTwoApproved && !s.examinerTwoReject) {
          pending.push(s);
        }
      }

    });

    console.log("peanding", pending);
    console.log("approved", approved);
    console.log("rejected", rejected);

    console.log(students);
    res.render("Examiner/Approve", {
      user: req.session.user,
      students: students,pending,approved,rejected,
      csrfToken: req.csrfToken(),
      layout: "mainEx.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});

route.get("/results", ensureAuth,ensureExaminer, async (req, res, next) => {
  try {
    var allstudents = await STUDENT.find({
      $or: [
        {
          examinerOneId: req.session.user._id,
        },
        {
          examinerTwoId: req.session.user._id,
        },
      ],
    }).lean();

    res.render("Examiner/studentsResult", {
      user: req.session.user,
      students: allstudents,
      layout: "mainEx.hbs",

    });
  } catch (error) {
    res.json(error);
  }
});

route.get("/results/:id", ensureAuth,ensureExaminer, async (req, res, next) => {
  try {
    const student = await STUDENT.findOne({
      _id: req.params.id,
    }).lean();

    if (student == null) {
      return res.send("No student found!");
    }

    const result = await RESULT.findOne({
      studentId: req.params.id,
      reviewerId: req.session.user._id,
    }).lean();

    res.render("Examiner/Results", {
      user: req.session.user,
      student: student,
      result,
      layout: "mainEx.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});

route.get("/deleteResult/:id", ensureAuth,ensureExaminer,async (req, res, next) => {
  try {
    const student = await STUDENT.findOne({
      _id: req.params.id,
    }).lean();

    if (student == null) {
      return res.send("No student found!");
    }
    const result = await RESULT.findOne({
      studentId: req.params.id,
      reviewerId: req.session.user._id,
    }).lean();

    await RESULT.findByIdAndDelete(
      result._id,

      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error and could not delete the result" + err);
          res.json({
            message: "Database Update Failure",
          });
        }
        res.redirect(`/Examiner/results/${student._id}`);
        console.log("This is the DeletedResponse: " + response);
      }
    );
  } catch (error) {
    res.json(error);
  }
});

route.get("/examInfo", ensureAuth,ensureExaminer, async (req, res, next) => {
  try {
    const examInfo = await EXAMINFORMATION.find({
      $or: [
        {
          examinerOneId: req.session.user._id,
        },
        {
          examinerTwoId: req.session.user._id,
        },
      ],
    })
      .lean()
      .populate("studentId")
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("supervisorId")
      .populate("chairPersonId");

    console.log("examInfo: ", examInfo);

    res.render("Examiner/vivaExam", {
      user: req.session.user,
      examInfo,
      layout: "mainchair.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});

route.get("/vivaExamInfo/:id", ensureAuth,ensureExaminer, async (req, res, next) => {
  console.log("id:", req.params.id);

  try {
    console.log("wardan");

    const stu = await STUDENT.findById(req.params.id)
      .lean()
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("chairPersonId");

    if (stu == null) {
      return res.send("no student found!");
    }
    console.log("wardan1");

    const examInfo = await EXAMINFORMATION.findOne({
      studentId: stu._id,
    }).lean();

    console.log("wardan2");

    res.render("Examiner/vivaExamInfo", {
      user: req.session.user,
      stu,
      examInfo,
      layout: "mainEx.hbs",
    });
  } catch (error) {
    res.json(error);
  }
});


route.post(
  "/profile",
  ensureAuth,ensureExaminer,  csrfProtection,
  upload.single("image"),
  async (req, res, next) => {
    console.log("The req.file:", req.file);
    console.log("The req.body", req.body);

    await EXAMINER.findByIdAndUpdate(
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
        res.redirect("/Examiner/profile");
        console.log("This is the Response123: " + response);
      }
    );
  }
);

route.post("/submitApprove", ensureAuth,ensureExaminer,csrfProtection, async (req, res, next) => {
  const { id } = req.body;
  const student = await STUDENT.findById(id).lean();
  console.log("student.examinerTwoId  ", student.examinerTwoId);

  // if this is the examiner two do
  if (student.examinerTwoId == req.session.user._id) {
    try {
      await STUDENT.findByIdAndUpdate(
        id,
        {
          examinerTwoApproved: true,
        },
        {
          new: true,
        },

        function (err, response) {
          // Handle any possible database errors
          console.log("There is error and not able to retrieve the info");
          if (err) {
            console.log("we hit an error" + err);
            res.json({
              message: "Database Update Failure",
            });
          }

          res.redirect("approve");
          console.log("This is the Response: ", response);
        }
      );
    } catch (error) {
      res.json(error);
    }
  } else {
    try {
      await STUDENT.findByIdAndUpdate(
        id,
        {
          examinerOneApproved: true,
        },
        {
          new: true,
        },

        function (err, response) {
          // Handle any possible database errors
          console.log("There is error and not able to retrieve the info");
          if (err) {
            console.log("we hit an error" + err);
            res.json({
              message: "Database Update Failure",
            });
          }

          res.redirect("approve");
          console.log("This is the Response: ", response);
        }
      );
    } catch (error) {
      res.json(error);
    }
  }
});

route.post("/submitReject", ensureAuth,ensureExaminer,  csrfProtection,async (req, res, next) => {
  const { id } = req.body;

  const student = await STUDENT.findById(id).lean();
  console.log("student.examinerTwoId  ", student.examinerTwoId);

  // if this is the examiner two do
  if (student.examinerTwoId == req.session.user._id) {
    try {
      await STUDENT.findByIdAndUpdate(
        id,
        {
          examinerTwoReject: true,
        },
        {
          new: true,
        },

        function (err, response) {
          // Handle any possible database errors
          console.log("There is error and not able to retrieve the info");
          if (err) {
            console.log("we hit an error" + err);
            res.json({
              message: "Database Update Failure",
            });
          }

          res.redirect("approve");
          console.log("This is the Response: ", response);
        }
      );
    } catch (error) {
      res.json(error);
    }
  } else {
    try {
      await STUDENT.findByIdAndUpdate(
        id,
        {
          examinerOneReject: true,
        },
        {
          new: true,
        },

        function (err, response) {
          // Handle any possible database errors
          console.log("There is error and not able to retrieve the info");
          if (err) {
            console.log("we hit an error" + err);
            res.json({
              message: "Database Update Failure",
            });
          }

          res.redirect("approve");
          console.log("This is the Response: ", response);
        }
      );
    } catch (error) {
      res.json(error);
    }
  }
});
route.post("/editinfo", ensureAuth,ensureExaminer,  csrfProtection,async (req, res, next) => {
  const { fullName, phone, postion, institute, major, examinerType } = req.body;

  // console.log("The user information: ", req.session.user);
  // console.log("The user information sesstion user id :", req.session.user._id);
  console.log("The examiner Type: ", examinerType);

  try {
    await EXAMINER.findByIdAndUpdate(
      req.session.user._id,
      {
        fullName: fullName,
        phone: phone,
        postion: postion,
        institute: institute,
        major: major,
        examinerType: examinerType,
      },
      {
        new: true,
      },

      function (err, response) {
        // Handle any possible database errors
        console.log("There is error and not able to retrieve the info");
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: "Database Update Failure",
          });
        }
        req.session.user = response;

        res.redirect("profile");
        console.log("This is the Response: ", response);
      }
    );
  } catch (error) {
    res.json(error);
  }
});

route.post("/studentResults", ensureAuth,ensureExaminer,async (req, res, next) => {
  let { studentId } = req.body;
  console.log("studentId: ", studentId);
  console.log("REDWHAN ", req.session.user);

  const student = await STUDENT.findById(studentId).lean();

  if (student == null) {
    return res.send("No student found!");
  }

  const thereIsaResult = await RESULT.findOne({
    studentId: studentId,
    reviewerId: req.session.user._id,
  }).lean();

  if (thereIsaResult != null) {
    return res.send("Already has result");
  }

  try {
    req.body.reviewerId = req.session.user._id;
    var revewierResult = await RESULT.create(req.body);
    return res.send("done");

    //res.redirect(`/${req}/results/${studentId}`);
  } catch (error) {
    res.json(error);
  }
});


module.exports = route;

var express = require("express");
const route = express.Router();
const STUDENT = require("../models/Student");
const DOCUMENT = require("../models/Document");
const multer = require("multer");
const path = require("path");
const csrf = require("csurf");
const formidable = require("formidable");
var bodyParser = require("body-parser");

const { ensureAuth, ensureStudent } = require("../middleware/auth");
const csrfProtection = csrf();
//define storage for the images
const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, "./public/upload/images");
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, Date.now() + "$" + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
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
route.get("/", ensureAuth, ensureStudent, async (req, res, next) => {
  res.render("Student/dashboard", {
    user: req.session.user,
    layout: "mainSV.hbs",
  });
});

route.get("/dashboard", ensureAuth, ensureStudent, (req, res, next) => {
  res.render("Student/dashboard", {
    user: req.session.user,
    layout: "mainS",
  });
});

route.get("/home", ensureAuth, ensureStudent, (req, res, next) => {
  res.render("Student/dashboard", {
    user: req.session.user,
    layout: "mainS",
  });
});

route.get(
  "/profile",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  (req, res, next) => {
    res.render("Student/profile", {
      user: req.session.user,
      csrfToken: req.csrfToken(),
      layout: "mainS",
    });
  }
);
route.get(
  "/editinfo",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  (req, res, next) => {
    try {
      console.log("Fuck");
      res.render("Student/editinfo", {
        user: req.session.user,
        csrfToken: req.csrfToken(),
        layout: "mainS",
      });
    } catch (error) {
      res.json(error);
    }
  }
);
route.get(
  "/uploadDocuments",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  async (req, res, next) => {
    try {
      if (!req.session.user.supervisorId) {
        res.render("403");
      }

      const documents = await DOCUMENT.find({
        studentId: req.session.user._id,
      }).lean();

      let isProposal = false;
      let isPre = false;
      let isThesis = false;

      if (documents) {
        documents.forEach((element) => {
          console.log("element.fileType: ", element.fileType);

          if (element.fileType == "proposal") {
            isProposal = true;
          } else if (element.fileType == "Presentation") {
            isPre = true;
          } else if (element.fileType == "thesis") {
            isThesis = true;
          }
        });
      }
      console.log("isProposal: after:", isProposal);
      console.log("isPre: after:", isPre);
      console.log("isThesis: after:", isThesis);

      res.render("Student/uploadDocuments", {
        user: req.session.user,
        csrfToken: req.csrfToken(),
        documents,
        isProposal,
        isPre,
        isThesis,
        layout: "mainS",
      });
    } catch (error) {
      res.json(error);
    }
  }
);
route.get(
  "/studentDetails",
  ensureAuth,
  ensureStudent,
  async (req, res, next) => {
    const student = await STUDENT.findById(req.session.user._id)
      .lean()
      .populate("supervisorId")
      .populate("examinerOneId")
      .populate("examinerTwoId")
      .populate("chairPersonId");
    console.log("student info: ", student);

    //   res.json(student)

    res.render("Student/stuInfo", {
      user: req.session.user,
      student,
      layout: "mainS",
    });
  }
);

route.get("/getSV", ensureAuth, ensureStudent, async (req, res, next) => {
  try {
    const SV = await STUDENT.findById(req.session.user._id)
      .lean()
      .populate("supervisorId");
    // const SV = await SUPERVISOR.findById(req.session.user.supervisorId).lean();
    res.json(SV);
  } catch (error) {
    res.json(error);
  }
});
route.post(
  "/profile",
  ensureAuth,
  ensureStudent,
  upload.single("image"),
  async (req, res, next) => {
    console.log("Req file", req.file);
    console.log("req body", req.body);

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

//edit info post
route.post(
  "/editinfo",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  async (req, res, next) => {
    const {
      fullName,
      phone,
      program,
      projectType,
      semester,
      nationality,
      thesisTitle,
    } = req.body;

    try {
      await STUDENT.findByIdAndUpdate(
        req.session.user._id,
        {
          fullName: fullName,
          phone: phone,
          program: program,
          semester: semester,
          nationality: nationality,
          thesisTitle: thesisTitle,
          projectType: projectType,
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

          res.redirect("/Student/profile/:_csrf");
          console.log("This is the Response: " + response);
        }
      );
    } catch (error) {
      res.json(error);
    }
  }
);

//upload proposal
route.post(
  "/submitDoc",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  upload.single("document"),
  async (req, res, next) => {
    let doc = new DOCUMENT({
      supervisorId: req.session.user.supervisorId,
      studentId: req.session.user._id,
      documentName: req.file.filename,
      fileType: req.body.fileType,
      submittedDate: Date.now(),
    });

    if (req.session.user.supervisorId == null) {
      res.send("You must have a supervisor first");
    } else {
      const document = await DOCUMENT.find({
        studentId: req.session.user._id,
        fileType: req.body.fileType,
      }).lean();

      //fileType exits for loginedin user
      console.log("Req.userId : ", req.session.user._id);
      console.log("filetype : ", req.body.fileType);
      console.log("document : ", document);

      if (document) {
        //detlete boj

        document.forEach(async (element) => {
          await DOCUMENT.deleteOne({ _id: element._id });
          console.log("element", element);
          console.log("id: ", element._id);
          console.log("submitted Date: ", element.createdAt);
        });
      }

      try {
        await DOCUMENT.create(doc);
        res.redirect("/Student/uploadDocuments");
      } catch (error) {
        res.json(error);
      }
    }
  }
);

//upload presentation Slides
route.post(
  "/submitPresentationSlides",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  upload.single("document"),
  async (req, res, next) => {
    let doc = new DOCUMENT({
      supervisorId: req.session.user.supervisorId,
      studentId: req.session.user._id,
      documentName: req.file.filename,
      fileType: req.body.fileType,
      submittedDate: Date.now(),

      //create boolean to be true if there is a doc and false to
    });

    if (req.session.user.supervisorId == null) {
      res.send("You must have a supervisor first");
    } else {
      const document = await DOCUMENT.find({
        studentId: req.session.user._id,
        fileType: req.body.fileType,
      }).lean();

      //fileType exits for loginedin user
      console.log("Req.userId : ", req.session.user._id);
      console.log("filetype : ", req.body.fileType);
      console.log("document : ", document);

      if (document) {
        //detlete boj
        console.log("inside Mtherfucker");

        document.forEach(async (element) => {
          await DOCUMENT.deleteOne({ _id: element._id });
          console.log("element", element);
          console.log("id: ", element._id);
          console.log("submitted Date: ", element.createdAt);
        });
      }

      try {
        await DOCUMENT.create(doc);
        res.redirect("/Student/uploadDocuments");
      } catch (error) {
        res.json(error);
      }
    }
  }
);

//upload Thesis
route.post(
  "/submitThesis",
  ensureAuth,
  ensureStudent,
  csrfProtection,
  upload.single("document"),
  async (req, res, next) => {
    let doc = new DOCUMENT({
      supervisorId: req.session.user.supervisorId,
      studentId: req.session.user._id,
      documentName: req.file.filename,
      fileType: req.body.fileType,
      submittedDate: Date.now(),

      //create boolean to be true if there is a doc and false to
    });

    if (req.session.user.supervisorId == null) {
      res.send("You must have a supervisor first");
    } else {
      const document = await DOCUMENT.find({
        studentId: req.session.user._id,
        fileType: req.body.fileType,
      }).lean();

      //fileType exits for loginedin user
      console.log("Req.userId : ", req.session.user._id);
      console.log("filetype : ", req.body.fileType);
      console.log("document : ", document);

      if (document) {
        //detlete boj
        console.log("inside Mtherfucker");

        document.forEach(async (element) => {
          await DOCUMENT.deleteOne({ _id: element._id });
          console.log("element", element);
          console.log("id: ", element._id);
          console.log("submitted Date: ", element.createdAt);
        });
      }

      try {
        await DOCUMENT.create(doc);
        res.redirect("/Student/uploadDocuments");
      } catch (error) {
        res.json(error);
      }
    }
  }
);

module.exports = route;

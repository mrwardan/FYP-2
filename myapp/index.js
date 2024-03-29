const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const USER = require("./models/User");
const ADMIN = require("./models/Admin");
const SUPERVISOR = require("./models/Supervisor");
const STUDENT = require("./models/Student");
const EXAMINER = require("./models/Examiner");
const CHAIRPERSON = require("./models/Chairperson");
const EXAMINFORMATION = require("./models/ExamInformation");
const multer = require("multer");
const MongoStore = require("connect-mongo");
const {
  ifEquals,
  select,
  ifIn,
  toSplitFile
} = require("./helpers/hbs");
const Swal = require("sweetalert2");
const {
  v4: uuidv4
} = require("uuid");
var nodemailer = require("nodemailer");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const logger = require("./middleware/logger");
const {
  ensureCAPCHA
} = require("./middleware/auth");
const {
  stringify
} = require("querystring");
const fetch = require("node-fetch");

const bcrypt = require("bcryptjs");
const {
  getLogger
} = require("nodemailer/lib/shared");
const {
  nextTick
} = require("process");
const csrf = require("csurf");
const app = express();
const port = 3333; // || process.env.PORT
const DBurl =
  "mongodb+srv://Mohammed:Mohammed1234$@viva.yvpma.mongodb.net/Viva?retryWrites=true&w=majority";

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: DBurl,
    }),
    //saveUninitialized: true,
    // cookie: { secure: true }
  })
);
const csrfProtection = csrf();

app.use(express.static(path.join(__dirname, "./public")));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DBurl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      useFindAndModify: false,

      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MonogDB connected successfuly");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
app.use(csrfProtection);

// body parser
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
//initilize middelware
app.use(logger);

app.engine(
  "hbs",
  exphbs({
    helpers: {
      ifEquals,
      select,
      ifIn,
      toSplitFile
    },
    defaultLayout: false,
    extname: "hbs",
  })
);
app.set("view engine", "hbs");

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
  subject: "Use the link to change your password", // Subject line
  html: "", // plain text body
};

// The render render a hbs file
// redirect redirect to a route

app.get("/", (req, res) => {
  res.redirect("/login");
});
app.get("/signup", csrfProtection, (req, res) => {
  res.render("Rform", {
    csrfToken: req.csrfToken(),
    layout: "main"
  });
});

app.get("/login", csrfProtection, (req, res) => {
  // console.log("hmm", req.body);
  res.render("login", {
    csrfToken: req.csrfToken(),
    layout: false
  });
});
app.get("/sub", (req, res) => {
  // console.log("hmm", req.body);
  res.render("sub");
});

// wardan is king

app.get("/resetPassword", csrfProtection, (req, res) => {
  res.render("resetPassword", {
    csrfToken: req.csrfToken(),
    layout: false
  });
});
app.get("/changePassword", (req, res) => {
  // console.log(req.query);
  const {
    code
  } = req.query;

  res.render("changePassword", {
    layout: false,
    code: code
  });
});

app.post("/changePassword", csrfProtection, async (req, res) => {
  const {
    newPass1,
    newpass2,
    code
  } = req.body;
  console.log(req.body);

  var foundCode = await USER.findOne({
    resetCode: code
  });

  if (foundCode) {
    console.log("foundcode: ", foundCode);
    console.log("code:", code);

    try {
      console.log("redwan");
      console.log("newPass1", newPass1);
      console.log("newPass2", newpass2);

      if (newPass1 === newpass2) {
        console.log("wardan");

        let hashPass = await bcrypt.hash(newpass2, 7);

        console.log("hashPass:  ", hashPass);

        try {
          await USER.findByIdAndUpdate(
            foundCode._id, {
              password: hashPass,
              resetCode: ""
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

              console.log(
                "This is the Response with new password: " + response
              );
              res.send("Password change you can login");
            }
          );
        } catch (error) {
          res.json(error);
        }
      }
    } catch (error) {
      res.json(error);
    }
  }
});

app.post("/subscribe", async (req, res) => {
  if (!req.body.captcha)
    return res.json({
      success: false,
      msg: "Please select captcha"
    });

  // Secret key
  const secretKey = "6Lfo1EobAAAAAMFe6l1-0iec3lZPZEnTWzmwMb9p";

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.socket.remoteAddress,
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then((res) => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({
      success: false,
      msg: "Failed captcha verification"
    });

  // If successful
  return res.json({
    success: true,
    msg: "Captcha passed"
  });
});

app.post("/resetPassword", ensureCAPCHA, async (req, res) => {
  const {
    email
  } = req.body;
  console.log(email);

  try {
    var foundeEmail = await USER.findOne({
      email: email
    });

    console.log("email in databse", foundeEmail);

    if (foundeEmail) {
      var link = "";
      let hash = uuidv4();
      console.log("Hash: ", hash);

      await USER.findByIdAndUpdate(
        foundeEmail._id, {
          resetCode: hash
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

          // res.send("Go to your mail")
          link = `http://localhost:9999/changePassword?code=${hash}`;
          console.log(link);

          // res.render("resetPassword", {
          //   layout: false,
          //   msg: " If an account exists for that email address, we will email you instructions for resetting your password. ",
          // });

          console.log("This is the Response: " + response);

          mailOptions.to = email;
          mailOptions.html = ` 
          <a href="${link}"> Click here to reset your password</a>
          `;

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) console.log(err);
            else console.log(info);
          });
          return res.json({
            success: true,
            msg: "Captcha passed",
            message: "If an account exists for that email address, we will email you instructions for resetting your password. ",
          });
        }
      );
    } else {
      return res.json({
        success: true,
        msg: "Captcha passed",
        message: "If an account exists for that email address, we will email you instructions for resetting your password. ",
      });
    }
  } catch (error) {
    res.json(error);
  }
});

app.post("/signup", csrfProtection, ensureCAPCHA, async (req, res) => {
  console.log("req.body: ", req.body);

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
    console.log("The type is :", type);

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
    return res.json({
      success: true,
      msg: "Captcha passed"
    });

    //alert('User is created successfully')
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({
        status: "error",
        error: "Email already in use"
      });
    }
    throw error;
  }

  // if (req.session.user_id === undefined) {
  //   res.redirect("login");
  // } else {
  //   if (req.session.user.type === "Admin") {
  //     res.redirect(req.session.user.type + "/Manageusers");
  //   }
  // }
});

app.post("/login", csrfProtection, ensureCAPCHA, async (req, res) => {
  const {
    email,
    password
  } = req.body;

 //// not complete 
  // if(!/^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}+)*$/.test(email))
  // if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`|~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) 
  // // General Email Regex (RFC 5322 Official Standard)

  // //if (?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])*$/.test(email))
  // {

  //   return res.json({
  //     success: false,
  //     msg: "Email provided is not valid: please follow the following format: abc@gmail.com",
  //     // type: user.type,
  //   });
    // res.send(" Email containes forrbiding chars ");
    
  //} 
  //else {
    
    console.log(req.body);
    const user = await USER.findOne({
      email: email
    }).lean();
    if (!user) {
      console.log("IS it null?", user);
      return res.render("login", {
        csrfToken: req.csrfToken(),
        wrongPass: "Wrong email or password",
      });

      //return res.status(400).send("Cannot find username");
    }

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        var userData_ST = "";
        var userData_SP = "";
        var userData_EX = "";
        var userData_AD = "";
        var userData_CH = "";

        switch (user.type) {
          case "Chairperson":
            try {
              userData_CH = await CHAIRPERSON.findById(user.userId);
              req.session.user = userData_CH;
            } catch (error) {
              console.log(error);
            }

            break;

          case "Student":
            try {
              userData_ST = await STUDENT.findById(user.userId);
              console.log("Twst here: ", userData_ST);

              req.session.user = userData_ST;
              console.log(req.session.user);
            } catch (error) {
              console.log(error);
            }

            break;
          case "Supervisor":
            // console.log(req.body);
            try {
              userData_SP = await SUPERVISOR.findById(user.userId);
              console.log("Twst here: ", userData_SP);
              req.session.user = userData_SP;
              // console.log("Supervisor's userdata : ",userData);

              // console.log('The is the supervisor: ',supervisors);
            } catch (error) {
              console.log(error);
            }

            break;

          case "Examiner":
            try {
              userData_EX = await EXAMINER.findById(user.userId);
              req.session.user = userData_EX;
            } catch (error) {
              console.log(error);
            }

            break;
          case "Admin":
            try {
              userData_AD = await ADMIN.findById(user.userId).lean();
              console.log("admin is" + userData_AD);
              req.session.user = userData_AD;
            } catch (error) {
              console.log(error);
            }
            break;

          default:
            res.send("user type is not correct");
            break;
        }
        console.log(user);
        return res.json({
          success: true,
          msg: "Captcha passed",
          type: user.type,
        });
      } else {
        res.render("login", {
          csrfToken: req.csrfToken(),
          wrongPass: "Wrong email or password",
        });
      }
    }
//  }
});

//sign out
app.get("/signout", (req, res, next) => {
  console.log("heloooooooo");
  req.session.destroy();
  res.redirect("/login");
});

app.use("/Student", require("./routes/student"));
app.use("/Supervisor", require("./routes/supervisor"));
app.use("/Examiner", require("./routes/examiner"));
app.use("/Admin", require("./routes/admin"));
app.use("/Chairperson", require("./routes/chairperson"));

// app.all('*', function(req, res) {
//   res.status(404).render('login');

// });

app.get("*", (req, res) => {
  res.render("pageNotFound");
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

connectDB();
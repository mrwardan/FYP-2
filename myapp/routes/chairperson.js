var express = require('express');
const route = express.Router();
const CHAIRPERSON = require("../models/Chairperson");
const EXAMINER = require('../models/Examiner');
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');
const multer = require('multer');
const path = require('path');
const Swal = require('sweetalert2');






const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, './public/upload/images');
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

  }
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
    cb('Error: Images Only!');

  }
}


route.get('/', ensureAuth, async (req, res, next) => {


  // res.json(user);
  res.render('Chairperson/Dashboard', {
    user: req.session.user,
    layout: 'mainchair.hbs'
  })


})
route.get('/dashboard', ensureAuth, async (req, res, next) => {

  //res.json(user);

  res.render('Chairperson/Dashboard', {
    user: req.session.user,
    layout: 'mainchair.hbs'
  })


})

route.get('/home', ensureAuth, (req, res, next) => {
  res.render('Chairperson/Dashboard', {
    user: req.session.user,
    layout: 'mainchair.hbs'
  })

})
route.get('/profile', ensureAuth, (req, res, next) => {
  res.render('Chairperson/profile', {
    user: req.session.user,
    layout: 'mainchair.hbs'
  })


})

route.get('/editinfo', ensureAuth, (req, res, next) => {
  res.render('Chairperson/editinfo', {
    user: req.session.user,
    layout: 'mainchair.hbs'
  })

})
route.get('/approve', ensureAuth, async (req, res, next) => {


  try {

    const students = await STUDENT.find({ chairPersonId: req.session.user._id }).lean().populate("supervisorId");

   let userID = false;

    if(req.session.user._id){
    userID = true;
      
    }
    res.render('Chairperson/Approve', {
      user: req.session.user,
      students: students,
      userID,
      layout: 'mainchair.hbs'
    })


  } catch (error) {

    res.json(error)


  }


})

route.get('/results', ensureAuth, async (req, res, next) =>{

  res.render('Chairperson/Results',  {
    user: req.session.user,
    layout: 'mainchair.hbs'
  })

})
route.get('/signout', (req, res, next) => {
  req.session.destroy();
  res.render('login', {
    layout: 'mainchair'
  })

})


route.post('/profile', ensureAuth, upload.single('image'), async (req, res, next) => {
  console.log('The req.file:', req.file);
  console.log('The req.body', req.body);

  await CHAIRPERSON.findByIdAndUpdate(req.session.user._id, {
      image: req.file.filename
    }, {
      new: true
    },

    function (err, response) {
      // Handle any possible database errors
      if (err) {
        console.log("we hit an error" + err);
        res.json({
          message: 'Database Update Failure'
        });
      }
      req.session.user = response;
      res.redirect('profile')
      console.log("This is the Response123: " + response);
    })
})

route.post('/submitApprove', ensureAuth, async (req, res, next) => {
  const {
    id
  } = req.body;
  console.log("Wardan love 2 ");

  // if the examiner 


  try {

    await STUDENT.findByIdAndUpdate(id, {
        chairPersonApproved: true
      }, {
        new: true
      },

      function (err, response) {
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: 'Database Update Failure'
          });
        }

        res.redirect('approve')
        console.log("This is the Response: ", response);
      })



  } catch (error) {
    res.json(error)
  }
})
route.post('/editinfo', ensureAuth, async (req, res, next) => {
  console.log('Wardan good');
  const {
    fullName,
    phone,
    postion,
    institute,
    major,
  } = req.body;

  // console.log("The user information: ", req.session.user);
  // console.log("The user information sesstion user id :", req.session.user._id);
  try {

    await CHAIRPERSON.findByIdAndUpdate(req.session.user._id, {
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
        console.log('There is error and not able to retrieve the info');
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: 'Database Update Failure'
          });
        }
        req.session.user = response;

        res.redirect('profile')
        console.log("This is the Response: ", response);
      })



  } catch (error) {
    res.json(error)
  }



})



function ensureAuth(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    res.redirect('login');
  }

}

module.exports = route;
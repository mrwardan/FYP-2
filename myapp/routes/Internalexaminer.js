var express = require('express');
const route = express.Router();
const EXAMINER = require('../models/Examiner');
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');
const multer = require('multer');
const path = require('path')





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
  fileFilter: function(req, file, cb){
   let ch = checkFileType(file, cb);
   console.log(ch);
   
  }
});

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
   
  }
}


route.get('/dashboard', (req, res, next) =>
{
  console.log(req.session.user);
    res.render('Examiner/Dashboard' , {user: req.session.user, layout:'mainEx.hbs'})


})
route.get('/home',ensureAuth, (req, res, next) =>
{
    res.render('Examiner/Dashboard', {user: req.session.user, layout:'mainEx.hbs'})

})
route.get('/profile', ensureAuth,  (req, res, next) =>
{
    res.render('Examiner/profile', {user: req.session.user, layout:'mainEx.hbs'})
    

})

route.get('/editinfo',ensureAuth,  (req, res, next) =>
{
    res.render('Examiner/editinfo', {user: req.session.user, layout:'mainEx.hbs'})

})
route.get('/approve',ensureAuth,  (req, res, next) =>
{

  
  try {
    const students = await STUDENT.find({}).lean()

    
  } catch (error) {
    
  }
    //res.render('Examiner/Approve', {user: req.session.user, layout:'mainEx.hbs'})


})
route.get('/signout',(req, res, next) =>
{
  req.session.destroy(); 
  res.render('login', {layout: 'mainEx'})

})


route.post('/profile', ensureAuth, upload.single('image') , async (req, res, next) =>
{
   console.log('The req.file:',req.file);
   console.log('The req.body',req.body);

  await EXAMINER.findByIdAndUpdate(req.session.user._id, {image:req.file.filename},  {new: true},
  
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
route.post('/editinfo', ensureAuth,  async  (req, res, next) =>
{
  const { fullName, phone, postion, institute, major, examinerType} =req.body;

  console.log("The user information: ", req.session.user);
  console.log("The user information sesstion user id :", req.session.user._id);
  console.log("The user information full name: ", req.session.user.fullName);
  
    try {
        
     await EXAMINER.findByIdAndUpdate(req.session.user._id, {fullName:fullName, phone:phone,postion:postion, institute:institute, major:major, examinerType: examinerType},  {new: true},
  
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
        console.log("This is the Response: " , response);
      })
  
  
      
    } catch (error) {
      res.json(error)
    }
    

  
})



function ensureAuth(req,res,next) {
  if(req.session.user)
  {
    next()
  }else
  {
    res.redirect('login');
  }
  
}

module.exports = route;

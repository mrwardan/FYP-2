var express = require('express');
const route = express.Router();
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');
const EXAMINER = require('../models/Examiner');
const multer = require('multer');
const path = require('path');
const { findById } = require('../models/Student');



//define storage for the images

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
route.get('/', ensureAuth, async (req, res, next) =>
{
  


 res.render('Supervisor/Dashboard', {user: req.session.user,  layout: 'mainSV.hbs'})
//res.json(req.session.user);

//  console.log('User Name from session : ', user.fullName );

})

route.get('/dashboard', ensureAuth, async (req, res, next) =>
{
  


 res.render('Supervisor/Dashboard', {user: req.session.user,  layout: 'mainSV.hbs'})
//res.json(req.session.user);

//  console.log('User Name from session : ', user.fullName );

})

route.get('/home',ensureAuth, (req, res, next) =>
{
    res.render('Supervisor/Dashboard', {user: req.session.user, layout:'mainSV.hbs'})

})
route.get('/profile', ensureAuth,  (req, res, next) =>
{
    res.render('Supervisor/profile', {user: req.session.user, layout:'mainSV.hbs'})

})

route.get('/students',ensureAuth, async (req, res, next) =>
{
  try {
    
    const allstudents = await STUDENT.find({supervisorId: req.session.user._id}).lean().populate("internalExaminerId").populate("externalExaminerId")
    //console.log(allstudents);
    // console.log("THE STUDENT INFORMATION: ",allstudents);

    res.render('Supervisor/students', {students: allstudents, user: req.session.user, layout:'mainSV.hbs'})
    
  } catch (error) {
    
  }
   

})


route.get('/editinfo',ensureAuth,  (req, res, next) =>
{
    res.render('Supervisor/editinfo', {user: req.session.user, layout:'mainSV.hbs'})

})
route.get('/addStudent',ensureAuth,  async (req, res, next) =>
{
  const students = await STUDENT.find({}).lean();
  res.render('Supervisor/students', {user: req.session.user, students: students, layout:false})

})

route.get('/manageExaminers',ensureAuth,  async (req, res, next) =>
{
  res.render('Supervisor/examinersSelection', {user: req.session.user, layout:'mainSV.hbs'})

})




//
route.get('/choose',ensureAuth,  async (req, res, next) =>
{ 
  const {id} = req.query;
 // const id = req.params.id;
 
 
try {
  
  const student = await STUDENT.findById(id).lean().populate("internalExaminerId").populate("externalExaminerId");
  //console.log("student");
  const examiners = await EXAMINER.find({}).lean();
 // console.log('The student is:', student);

  if(student)
  {
     
   
    res.render('Supervisor/choose', {student: student, examiners:examiners, user: req.session.user, layout:'mainSV.hbs'})

  }else{
res.send('Not Found')  }


  
} catch (error) {

  res.json(error)
}

//------

 
})
route.get('/signout',(req, res, next) =>
{
  req.session.destroy(); 
  res.render('login', {layout: 'mainSV'})

})
route.post('/profile', ensureAuth, upload.single('image') , async (req, res, next) =>
{
  // console.log(req.file);
  // console.log(req.body);

  await SUPERVISOR.findByIdAndUpdate(req.session.user._id, {image:req.file.filename},  {new: true},
  
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
      console.log("This is the Response: " + response);
    })
})
route.post('/editinfo', ensureAuth,  async  (req, res, next) =>
{
  const { fullName, phone, postion, institute, major} =req.body;

  // console.log("The user information: "+req.session.user);
   console.log('The request file:', req.file);


   
   

  
    try {
     
  
     
     await SUPERVISOR.findByIdAndUpdate(req.session.user._id, {fullName:fullName, phone:phone,postion:postion, institute:institute, major:major},  {new: true},
  
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
        console.log("This is the Response: " + response);
      })
  
  
      
    } catch (error) {
      res.json(error)
    }
    

  
})

route.post('/addStudent', ensureAuth, async (req, res, next) =>
{
  
  const { matricNo } = req.body;

  try {

    const student = await STUDENT.findOne({ matricNo:matricNo }).lean()

    if(!student)
    {
      res.send("Matric was not found")
    }

  await STUDENT.findByIdAndUpdate(student._id, {supervisorId: req.session.user._id},  {new: true},

    function (err, response) {
      // Handle any possible database errors
      if (err) {
        console.log("we hit an error" + err);
        res.json({
          message: 'Database Update Failure'
        });
      }
      console.log("This is the Response: " + response);
     
    })

 
    


     res.redirect('students')
    
  } catch (error) {
    
  }


})




route.post('/choose',ensureAuth,  async (req, res, next) =>
{


  const { matricNo, externalExaminer, internalExaminer } = req.body;
  const student = await STUDENT.findOne({ matricNo:matricNo  }).lean()
  console.log("What info: ", student);

  try {

  if(internalExaminer == 'null' )
  {
    await STUDENT.findByIdAndUpdate( student._id,
        {new: true, $unset:{internalExaminerId:1} },
  
      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: 'Database Update Failure'
          });
        }
       
        console.log("This is the Response: " + response);

        // res.redirect('students')
      })
  } else
  {
    await STUDENT.findByIdAndUpdate( student._id,
      {
        internalExaminerId:internalExaminer,internalExaminerApproved:false, submittedDate: Date.now(),
       
      },  {new: true},
  
      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: 'Database Update Failure'
          });
        }
       
        console.log("This is the Response: " + response);

       
      })

  }
   if( externalExaminer ==  'null')
  {
    await STUDENT.findByIdAndUpdate( student._id,
      {new: true, $unset:{externalExaminerId:1} },

    function (err, response) {
      // Handle any possible database errors
      if (err) {
        console.log("we hit an error" + err);
        res.json({
          message: 'Database Update Failure'
        });
      }
     
      console.log("This is the Response: " + response);

      // res.redirect('students')
    })

  }else
  {
    await STUDENT.findByIdAndUpdate( student._id,
      {
       
        externalExaminerId:externalExaminer,externalExaminerApproved:false,submittedDate:Date.now(),
      },  {new: true},
  
      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: 'Database Update Failure'
          });
        }
       
        console.log("This is the Response: " + response);

      
      })

  }
   
  res.redirect('students')
    
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
    res.redirect('/login');
  }
  
}

module.exports = route;

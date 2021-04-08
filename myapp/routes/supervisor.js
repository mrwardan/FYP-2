var express = require('express');
const route = express.Router();
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');



route.get('/dashboard', ensureAuth, async (req, res, next) =>
{
  


 res.render('Supervisor/Dashboard', {user: req.session.user,  layout: 'mainSV.hbs'})
//res.json(req.session.user);

 console.log('User Name from session : ',user.fullName );

})

route.get('/home',ensureAuth, (req, res, next) =>
{
    res.render('Supervisor/Dashboard', {user: req.session.user, layout:'mainSV.hbs'})

})
route.get('/profile', ensureAuth,  (req, res, next) =>
{
    res.render('Supervisor/profile', {user: req.session.user, layout:'mainSV.hbs'})

})

route.get('/students',ensureAuth,  (req, res, next) =>
{
    res.render('Supervisor/students', {user: req.session.user, layout:'mainSV.hbs'})

})
route.get('/editinfo',ensureAuth,  (req, res, next) =>
{
    res.render('Supervisor/editinfo', {user: req.session.user, layout:'mainSV.hbs'})

})
route.post('/editinfo',ensureAuth, async  (req, res, next) =>
{
  const { phone } =req.body;

  console.log("TEST: "+req.session.user);
    try {
  
     
    await SUPERVISOR.findByIdAndUpdate(req.session.user._id, {phone:phone},  {new: true},
  
      function (err, response) {
        // Handle any possible database errors
        if (err) {
          console.log("we hit an error" + err);
          res.json({
            message: 'Database Update Failure'
          });
        }

        res.send('scussess')
        console.log("This is the Response: " + response);
      })
  
  
      
    } catch (error) {
      res.json(error)
    }

  
})

route.post('/assign', ensureAuth, async (req, res, next) =>
{

  const { matricNo } =req.body;

console.log(req.session.user);
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


     res.send('scussess')
    
  } catch (error) {
    
  }


})

route.get('/getall', async (req,res)=>{

try {
  const allstudents = await STUDENT.find({supervisorId: req.session.user._id}).lean()
  res.json(allstudents);
  
} catch (error) {
  res.json(error)
}
})


route.get('/signout',(req, res, next) =>
{
  req.session.destroy(); 
  res.render('login', {layout: 'mainSV'})

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

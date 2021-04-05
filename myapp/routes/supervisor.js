var express = require('express');
const route = express.Router();
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');



route.get('/dashboard', (req, res, next) =>
{
    res.render('Supervisor/Dashboard')

})
route.post('/assign', async (req, res, next) =>
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

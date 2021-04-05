var express = require('express');
const route = express.Router();
const EXAMINER = require('../models/Examiner');
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');
// const ADMIN = require('../models/admin');



route.get('/dashboard',ensureAuth,(req, res, next) =>
{
    res.render('adminHome')

})
route.get('/manageUsers', ensureAuth ,async (req, res) => {



  // const admins = await ADMIN.find({}).lean();
  const examiners = await EXAMINER.find({}).lean();
  const students = await STUDENT.find({}).lean();
  const supervisors = await SUPERVISOR.find({}).lean();
  
  //res.json(users);


  res.render('crud', { supervisors: supervisors, students: students, examiners: examiners,  layout: false });

})





function ensureAuth(req,res,next) {
  console.log(req.session.user);
  if(req.session.user)
  {
    next()
  }else
  {
    res.redirect('/login');
  }
  
}

module.exports = route;

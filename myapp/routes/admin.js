var express = require('express');
const route = express.Router();
const EXAMINER = require('../models/Examiner');
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');
// const ADMIN = require('../models/admin');



route.get('/dashboard',ensureAuth,(req, res, next) =>
{
  
    res.render('Admin/adminHome', {layout: 'mainAdmin'})

})
route.get('/Home',ensureAuth,(req, res, next) =>
{
    res.render('Admin/adminHome', {layout: 'mainAdmin'})

})
route.get('/signout',(req, res, next) =>
{
  req.session.destroy(); 
  res.render('login', {layout: 'mainAdmin'})

})
route.get('/manageUsers', ensureAuth ,async (req, res) => {



  // const admins = await ADMIN.find({}).lean();
  const examiners = await EXAMINER.find({}).lean();
  const students = await STUDENT.find({}).lean();
  const supervisors = await SUPERVISOR.find({}).lean();
  
  //res.json(users);


  res.render('Admin/Dashboard', { supervisors: supervisors, students: students, examiners: examiners,  layout: false });

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

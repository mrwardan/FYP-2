var express = require('express');
const route = express.Router();
const USER = require("../models/User");
const CHAIRPERSON = require("../models/Chairperson");
const EXAMINER = require('../models/Examiner');
const STUDENT = require('../models/Student');
const SUPERVISOR = require('../models/Supervisor');
const ADMIN = require('../models/Admin');



route.get('/dashboard',ensureAuth, ensureAdmin, (req, res, next) =>
{
  
    res.render('Admin/adminHome', {layout: 'mainAdmin'})

})
route.get('/Home',ensureAuth,ensureAdmin, (req, res, next) =>
{
    res.render('Admin/adminHome', {layout: 'mainAdmin'})

})

route.get('/manageUsers', ensureAuth ,ensureAdmin, async (req, res) => {



   const admins = await ADMIN.find({}).lean();
  const examiners = await EXAMINER.find({}).lean();
  const students = await STUDENT.find({}).lean();
  const supervisors = await SUPERVISOR.find({}).lean();
  
  //res.json(users);


  res.render('Admin/Dashboard', { supervisors: supervisors, students: students, examiners: examiners, admins:admins,   layout: 'mainAdmin' });

})




route.get('/delete/:id', ensureAuth, ensureAdmin, async (req, res) => {


  
      
   const user = await USER.findOne({userId:req.params.id});
   const user1 = await EXAMINER.findOne({_id:req.params.id});
   const user2 = await CHAIRPERSON.findOne({_id:req.params.id});
   const user3 = await SUPERVISOR.findOne({_id:req.params.id});
   const user4 = await ADMIN.findOne({_id:req.params.id});


       
     
     switch (user.type) {

       case "Admin":

        if(user4)
        {
          console.log("great");
   
        await ADMIN.findByIdAndDelete(user4);
        }
         break;
         case "Supervisor":

          if(user3)
          {
            console.log("great");
     
          await SUPERVISOR.findByIdAndDelete(user3);
          }
           break;
           case "Examiner":

            if(user1)
            {
              console.log("great");
       
            await EXAMINER.findByIdAndDelete(user1);
            }
             break;
             case "Chairperson":

              if(user2)
              {
                console.log("great");
         
              await CHAIRPERSON.findByIdAndDelete(user2);
              }
               break;
              
     
       default:
         break;

        
     }

     if(user)
     {
             await USER.findByIdAndDelete(user);

     }
     
     res.redirect('Admin/Dashboard')
  

})


route.get('/view/:id',ensureAuth, ensureAdmin,  async (req, res) => {
  console.log("id: ",req.params.id);

  const { id } = req.params;
  console.log('log',id);

  try {

   var user =  await USER.findOne({userId:id})
  console.log(user);

   if(user)
   {
     res.json(user)
   } else
   {
     res.send('info not find')
   }

  } catch (error) {
    console.log(error);
    res.send(' not find')
  }


})



route.get('/signout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
})


route.get('/adminHome',ensureAuth, ensureAdmin,  (req, res) => {

  res.render('adminHome', {user: req.session.user});
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
function ensureAdmin(req,res,next) {
  if(req.session.user.type ==="Admin")
  {
    next()
  }else
  {
    res.redirect(req.get('referer'));
  }
  
}




module.exports = route;

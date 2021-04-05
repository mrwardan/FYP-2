var express = require('express');
const route = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
const USER = require('../models/User');



route.get('/manageUsers', ensureAuth ,async (req, res) => {

  let admins = [];
  let supervisors = [];
  let students = [];
  let examiners = [];
  

  const users = await USER.find({}).select('-password').lean();
  users.forEach((user) => {
    
    console.log('The user is:',user.type)

    switch (user.type) {
      case 'admin':
        admins.push(user)
        // console.log('The user admin is:', user)
        break;
       case "supervisor":
         supervisors.push(user)
      //   // console.log('The user  supervisor is:', user)

         break;
       case "student":
        students.push(user)
   

        break;
      case "examiner":
        examiners.push(user)


        break;

      default:
        break;
    }
  })
  //res.json(users);
  console.log(admins);

  res.render('crud', { admins: admins, supervisors: supervisors, students: students, examiners: examiners,  layout: false });

})



route.get('/delete/:id', async (req, res) => {
  console.log(req.params);

  const { id } = req.params;
  try {
    await USER.findByIdAndDelete(id);

  } catch (error) {
    console.log(error);
  }
  //res.json(users);

  res.redirect('/crud');

})


route.get('/view/:id', async (req, res) => {
  console.log(req.params);

  const { id } = req.params;
  try {
   var user=  await USER.findById(id);
 
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
  res.redirect('login');
})

route.get('/studentPage', ensureAuth, (req, res) => {
  res.render('studentPage',{ layout: false, user: req.session.user } );
})

route.get('/adminHome', ensureAuth, (req, res) => {

  res.render('adminHome', {user: req.session.user});
})

// route.get('/manageUsers', (req, res) => {

//   res.render('crud');
// })


route.get('/login', (req, res) => {
  res.render('login', { layout: false, fail: false });
})
route.get('/signup', (req, res) => {
  res.render('Rform');
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

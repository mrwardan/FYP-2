var express = require('express');
const route = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
const USER = require('../models/User');



route.get('/Dashboard', async (req, res) => {
    

    const users = await USER.find({}).select('-password').lean();
    //res.json(users);

    res.render('crud', {users_list:users,layout:false}); 

  })

  route.get('/delete/:id', async (req, res) => {
      console.log(req.params);
      
    const {id}=req.params;
try {
    await USER.findByIdAndDelete(id);
    
} catch (error) {
    console.log(error);
}
    //res.json(users);

    res.redirect('/Dashboard'); 

  })
  
  


module.exports = route;

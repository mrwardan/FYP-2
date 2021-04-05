const express = require('express');
const session = require('express-session')
const path = require('path');
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const USER = require('./models/User');
const SUPERVISOR = require('./models/Supervisor');
const STUDENT = require('./models/Student');
const EXAMINER = require('./models/Examiner');


const { ok } = require('assert');
const bcrypt = require('bcryptjs');
const bcrypt1 = require('bcrypt')
const { response } = require('express');
const alert = require('alert');
const app = express();
const port = 9999;
const DBurl = 'mongodb+srv://Mohammed:Mohammed1234$@viva.yvpma.mongodb.net/Viva?retryWrites=true&w=majority';




app.use(session({
  secret: 'keyboard cat',
  resave: false,
  //saveUninitialized: true,
 // cookie: { secure: true }
}))

app.use(express.static(path.join(__dirname, './public')));
app.use('/', require('./routes/routes'));

const connectDB = async () => {
  try {

    const conn = await mongoose.connect(DBurl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      useFindAndModify: false,

      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log("MonogDB connected successfuly");

  } catch (error) {
    console.error(error);
    process.exit(1)

  }
}



// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//view engine
app.engine(
  "hbs",
  exphbs({

    defaultLayout: "main",
    extname: "hbs",
  })
);

app.get("/",(req,res)=>{
  res.redirect("/login")
})
app.post('/signup', async (req, res) => {
  console.log("req.body", req.body);
  const { type, email, password: plainTextPassword, fullName, major, phone , matricNo} = req.body


  let response = '';


  const password = await bcrypt.hash(plainTextPassword, 7)

  try {
    switch (type) {

       case "Supervisor":
        let data = {
          fullName,
          major,
          phone,
        
        }
        data.staffNo = matricNo;
         response = await SUPERVISOR.create(data)
///////////////////
         let user_Data = {
          type,
          email,
          password,


        
        }

        user_Data.userId = response._id;
        response = await USER.create(user_Data);

         

         break;
       case "Student":
       
         response = await STUDENT.create({
          fullName,
          major,
          phone,
          matricNo
        })

         let temp_data ={
          email,
          password,
          type,
          
        }
        temp_data.userId = response._id;

        let res2 = await USER.create(temp_data);


        break;
      case "Examiner":
       
        let Ex_data = {
          fullName,
          major,
          phone,
        
        }
        Ex_data.staffNo = matricNo;
         response = await EXAMINER.create(Ex_data)
///////////////////
         let Ex_user_Data = {
          type,
          email,
          password,


        
        }

        Ex_user_Data.userId = response._id;
        response = await USER.create(Ex_user_Data);

        break;

      default:
        break;
    }
  


    console.log('User created successfully: ', response)
    // alert('User is created successfully')
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ status: 'error', error: 'Username already in use' })
    }
    throw error
  }

  res.json({ status: 'ok' })

})






app.post('/login', async (req, res) => {

const {email, password} = req.body;

  const user = await USER.findOne({ email:email }).lean()
  console.log(user);



  if (user) {

    if (await bcrypt.compare(password, user.password)) {
        var userData="";
     
       switch (user.type) {
         case "Student":
          console.log('student');
          try {
            userData = await STUDENT.findById(user.userId)
            req.session.user =userData
          } catch (error) {
            console.log(error);
            
          }
          
           break;
           case "Supervisor":
            console.log("Supervisor: ");

            try {
              userData = await SUPERVISOR.findById(user.userId)
              req.session.user =userData
            } catch (error) {
              console.log(error);
              
            }
            
            
            break;
       
            case "Examiner":
              console.log("Examiner");
              try {
                userData = await EXAMINER.findById(user.userId)
                req.session.user =userData
              } catch (error) {
                console.log(error);
                
              }
              
              break;
              case "Admin":
                console.log("Admin");
                req.session.user =user
                break;
       
         default:
           break;
       }
       console.log("userData",userData);
     
       res.redirect(user.type+"/dashboard")
       

      
    }else{
      res.send("pass is wrong or not fouynd")
    }
  }
  else{
  console.log(user);
  return res.status(400).send('Cannot find username')

  }
  //   try {
  //     if (user.type === 'admin') {

  //       if (await bcrypt.compare(req.body.password, user.password)) {
  //         req.session.user = user;
  //          res.redirect('adminHome')
  //         // console.log('Nice', user)
  //       }

  //     }else if(user.type === 'student') {

  //       if (await bcrypt.compare(req.body.password, user.password)) {
  //         req.session.user = user;
      

  //          res.redirect('studentPage')
  //       }

 
        

  //       } else if(user.type == 'supervisor')
  //       {
         
  //         if (await bcrypt.compare(req.body.password, user.password)) {
  //           req.session.user = user;
  //            res.redirect('student')
  //           // console.log('Nice', user)
  //         }


  //       } else if(user.type == 'examiner')
  //       {
  //         if (await bcrypt.compare(req.body.password, user.password)) {
  //           req.session.user = user;
  //            res.redirect('adminHome')
  //           // console.log('Nice', user)
  //         }


  //       } else {
  //         res.render('login', { fail: true })
  //         res.send('pass is wrong')
  //       }
  //     } catch {
  //     res.status(500).send()
  //   }

  // } else {
  //   return res.status(400).send('Cannot find username')



  // }

})




app.use('/Student', require('./routes/student'));
app.use('/Supervisor', require('./routes/supervisor'));
app.use('/Examiner', require('./routes/examiner'));
app.use('/Admin', require('./routes/admin'));
app.all('*', function(req, res) {
  res.status(404).render('error');



});



app.set("view engine", "hbs");



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

connectDB();

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
const multer = require('multer');
const MongoStore = require("connect-mongo");
const {ifEquals, select} = require('./helpers/hbs')


const bcrypt = require('bcryptjs');
const app = express();
const port = 9999;
const DBurl = 'mongodb+srv://Mohammed:Mohammed1234$@viva.yvpma.mongodb.net/Viva?retryWrites=true&w=majority';




app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: DBurl
})
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

    helpers: {ifEquals, select},
    defaultLayout: "main",
    extname: "hbs",
  })
);


app.get("/",(req,res)=>{
  res.redirect("/login")
})
app.get("/signup",(req,res)=>{
  res.redirect("Rform", {layout: 'main.hbs'})
})
app.post('/signup', async (req, res) => {
  // console.log("req.body", req.body);
  const { type, email, password: plainTextPassword, fullName, major, phone , matricNo} = req.body


  let response_Supervisor = '';
  let response_Student= '';
  let response_Examiner = '';


  const password = await bcrypt.hash(plainTextPassword, 7)

  try {

    switch (type) {

       case "Supervisor":
        let data = {
          fullName,
          major,
          phone,
          email,
        
        }
        data.staffNo = matricNo;
        response_Supervisor = await SUPERVISOR.create(data)

         let user_Data = {
          type,
          email,
          password,

        }

        user_Data.userId = response_Supervisor._id;
        response_Supervisor = await USER.create(user_Data);

         

         break;
       case "Student":

       let studentData =
       {
        fullName,
        major,
        phone,
        matricNo,
        email,

       }
       
        response_Student = await STUDENT.create(studentData)

         let temp_data ={
          email,
          password,
          type,
          
        }
        temp_data.userId = response_Student._id;

         response_Student = await USER.create(temp_data);


        break;
      case "Examiner":
       
        let Ex_data = {
          fullName,
          major,
          phone,
          email,
        
        }
        Ex_data.staffNo = matricNo;

        response_Examiner = await EXAMINER.create(Ex_data)

         let Ex_user_Data = {
          type,
          email,
          password,


        
        }

        Ex_user_Data.userId = response_Examiner._id;
        response_Examiner = await USER.create(Ex_user_Data);


        break;

      default:
        break;
    }
  


    // console.log('User created successfully: ', response_Student)
    // alert('User is created successfully')
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ status: 'error', error: 'Username already in use' })
    }
    throw error
  }

  res.render('login');

})






app.post('/login', async (req, res) => {

  // console.log(req.body);


const {email, password} = req.body;

  const user = await USER.findOne({ email:email }).lean()
  // console.log('The user email is: ',req.body.email);



  if (user) {

    if (await bcrypt.compare(password, user.password)) {
      var userData_ST="";
      var userData_SP="";
      var userData_EX="";
      
     
       switch (user.type) {
         case "Student":
          console.log('student');
          try {
            userData_ST = await STUDENT.findById(user.userId)
            req.session.user =userData_ST
          } catch (error) {
            console.log(error);
            
          }
          
           break;
           case "Supervisor":
          // console.log(req.body);
            try {
              userData_SP = await SUPERVISOR.findById(user.userId)


              req.session.user =userData_SP
             // console.log("Supervisor's userdata : ",userData);

              // console.log('The is the supervisor: ',supervisors);
            } catch (error) {
              console.log(error);
              
            }
            
            
            break;
       
            case "Examiner":
              try {

                userData_EX = await EXAMINER.findById(user.userId)
                req.session.user =userData_EX;

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
     
       res.redirect(user.type + "/dashboard")
      //  console.log('The User Type: ',user.type);

      
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
// app.all('*', function(req, res) {
//   res.status(404).render('login');



// });

app.set("view engine", "hbs");



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

connectDB();

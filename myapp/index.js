const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const USER = require('./models/User');
const { ok } = require('assert');
const bcrypt = require('bcryptjs');
 const bcrypt1 = require('bcrypt')
const { response } = require('express');
const alert = require('alert');
const app = express();
const port = 9999;
const DBurl = 'mongodb+srv://Mohammed:Mohammed1234$@viva.yvpma.mongodb.net/Viva?retryWrites=true&w=majority';

app.use(express.static(path.join(__dirname, './public')));
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DBurl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
      // useCreateIndex: true

      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useCreateIndex: true
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
app.get('/login', (req, res) => {
  res.render('login', { layout: false });
})
app.get('/signup', (req, res) => {
  res.render('Rform');
})
// app.post('/login', async (req, res) => {
//   console.log(req.body);
//   const {email, password } = req.body;
// try {
// const user = await USER.findOne({email:email, password:password}).select("-password");
// if(user)
// {
//   console.log('Here is the USER INFORmation');
//    console.log(user);
//     res.json(user);

// } else
// {
//   res.redirect('/login');

// }

// } catch (error) {
//   res.send('ERROR!!!');

// }

// })


app.post('/signup', async (req, res) => {
  
  const { email,  password: plainTextPassword, fullName, username  } = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

  
	const password = await bcrypt.hash(plainTextPassword, 7)

	try {
		const response = await USER.create({
      email,
      password,
      fullName,
      username,
    })
 
   
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

app.post('/login', async (req,res) => {
 
  const user = await USER.findOne({username: req.body.username})
  


  if (user) {

    const hashedPass = await bcrypt.hash(req.body.password, 7)
    console.log('P1', user.password);
   console.log('P2', hashedPass );
   console.log(await bcrypt.compare(req.body.password, user.password))
    try {
      if(await bcrypt.compare(req.body.password, user.password)) {
        res.send('Success')
      } else {
        res.send('Not Allowed')
      }
    } catch {
      res.status(500).send()
    }

  } else
{
  return res.status(400).send('Cannot find username')

  
  
}
 
})

app.set("view engine", "hbs");
app.get('/wardan', (req, res) => {
  res.send('Hello wardan!')
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

connectDB();

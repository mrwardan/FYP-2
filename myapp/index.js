const express = require('express');
const path = require('path');

const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const USER = require('./models/User');
const DBurl = 'mongodb+srv://Mohammed:Mohammed1234$@viva.yvpma.mongodb.net/Viva?retryWrites=true&w=majority';

app.use(express.static(path.join(__dirname, './public')));
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DBurl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
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
app.post('/login', async (req, res) => {
  console.log(req.body);
  const {email, password } = req.body;
try {
const user = await USER.findOne({email:email, password:password}).select("-password");
if(user)
{

    res.json(user);
 
} else
{
  res.redirect('/login');

}
  
} catch (error) {
  res.send('ERROR!!!');

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

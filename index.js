const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());
const ipAddress = '0.0.0.0';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const Category = require('./Models/HomeScreen/Category');
const Carousal = require('./Models/HomeScreen/Carousal');
const ProducSliderOne = require('./Models/HomeScreen/ProducatSliderOne');
const DealsSquare = require('./Models/HomeScreen/DealsSquare');

//connection to mongodb backend
mongoose
  .connect('mongodb+srv://vaibhav:savi1703@cluster0.til2vdt.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to mongodb');
  })
  .catch(err => {
    console.log('Error:' + err);
  });

//API to Register a user
app.post('/register', async (req, res) => {
  try {
    const {name, email, password} = req.body;
    //check if email is already registered.
    const exsitingUser = await User.findOne({email});
    if (exsitingUser) {
      return res
        .status(400)
        .send('Email already registered on the application.');
    }
    //create new user.
    const newUser = new User({name, email, password});
    //generate and store the verification token for this new user.
    newUser.verificationToken = crypto.randomBytes(20).toString('hex');
    //save the user to the database
    await newUser.save();

    //send verification email to the user.
    sendVerificationEmail(newUser.email, newUser.verificationToken);
  } catch (e) {
    console.log('Error in registering new user', e);
    res.status(500).send(e);
  }
});

//API to send verification email to the user.

const sendVerificationEmail = async (email, verificationToken) => {
  //create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    //configuration of the email services
    service: 'gmail',
    auth: {
      user: 'amazoonllc@gmail.com',
      pass: 'ipiu xfgi jlsv pqeg',
    },
  });
  //compose the email messege.
  const mailOptions = {
    from: 'clickcart.com',
    to: email,
    subject: 'Email verification',
    text: `Click on the link to verify your registration : http://localhost:8000/verify/${verificationToken}`,
  };
  //send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log('Error in sending the verification email', e);
  }
};
//API to get data from backend

app.get('/data', async (req, res) => {
  try {
    // const name = req.params.name;
    const userData = await User.find();
    res.send(userData);
  } catch (e) {
    res.send(e);
  }
});

//API to verify the new user
app.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;
    //find the user with the given token
    const user = await User.findOne({verificationToken: token});
    if (!user) {
      return res.status(404).send('Invalid verification token');
    }
    //mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;
    await user.save(); //saving the user again because the verification toke value is updated.
    res.status(200).send('Email verified successfully');
  } catch (e) {
    res.state(500).send('Email verification failed');
  }
});
const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString('hex');
  return secretKey;
};
const secretKey = generateSecretKey();

//API to login
app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    //check if user exists.
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).send('Invalid Email or Password');
    }
    //check if password is right or not.
    if (user.password !== password) {
      return res.status(401).send('Invalid Password');
    }
    //generate a token.
    const token = jwt.sign({userId: user._id}, secretKey);
    console.log(token);

    res.status(200).send(token);
  } catch (error) {
    res.status(501).send('Login Failed');
  }
});

//API to add categories in the home Screen
app.post('/addCategory', async (req, res) => {
  try {
    const {name, url} = req.body;
    const newCategory = new Category({name, url});
    await newCategory.save();
    res.status(200).send('added new category');
  } catch (e) {
    res.status(401).send('Error in the adding category');
  }
});
//API to get categories data
app.get('/getCategory', async (req, res) => {
  try {
    const categories = await Category.find();
    console.log(categories);

    res.status(200).send(categories);
  } catch (e) {
    console.log(e);
    res.status(500).send('ERROR WHILE RETRIEVING THE DATA');
  }
});
//API to add categories in the carousal
app.post('/addCarousal', async (req, res) => {
  try {
    const {name, url} = req.body;
    const chunk = new Carousal({name, url});
    await chunk.save();
    res.status(200).send('DATA FOR CAROUSAL ADDED SUCCESSFULLY');
  } catch (E) {
    res.status(401).send('ERROR IN ADDING IMAGE TO CAROUSAL IN DATABASE.');
    console.log(E);
  }
});

//API to get carousal data
app.get('/getCarousal', async (req, res) => {
  try {
    const images = await Carousal.find();

    res.status(200).send(images);
  } catch (e) {
    res.status(401).send('ERROR IN GETTING IMAGE CAROUSAL FROM DATABASE.');
    console.log(E);
  }
});

//API to add data of ProductSliderOne
app.post('/addProductSliderOne', async (req, res) => {
  try {
    const {name, url} = req.body;
    const chunk = new ProducSliderOne({name, url});
    await chunk.save();
    res.status(200).send('DATA FOR PRODUCT SLIDER ONE ARE ADDED SUCCESSFULLY');
  } catch (E) {
    res.status(401).send('ERROR IN ADDING DATA TO DATABASE.');
    console.log(E);
  }
});

app.get('/getProductSliderOne', async (req, res) => {
  try {
    const data = await ProducSliderOne.find();

    res.status(200).send(data);
  } catch (e) {
    console.log(e);
    res.status(500).send('ERROR WHILE RETRIEVING THE DATA');
  }
});
//API to add DealsSquare
app.post('/addDealsSquare', async (req, res) => {
  try {
    const {url, off} = req.body;
    const data = new DealsSquare({url, off});
    await data.save();
    res.status(200).send('ADDED DATA FOR SQUARES OF DEALS');
  } catch (e) {
    console.log(e);
    res.status(400).send('ERROR IN ADDING DATA TO SQUARES OF DEALS');
  }
});
//API to get DealsSquare
app.get('/getDealsSquare', async (req, res) => {
  try {
    const data = await DealsSquare.find();
    res.status(200).send(data);
  } catch (e) {
    console.log(e);
    res.status(401).send('ERROR IN GETTING DATA OF SQUARES OF DEALS');
  }
});
app.listen(port, ipAddress, () => {
  console.log('Server running on http://' + ipAddress + ' : ' + port);
});
// app.listen(port, () => {
//   console.log('Server is running on port 8000');
// });

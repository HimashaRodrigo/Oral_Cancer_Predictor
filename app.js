require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { spawn } = require('child_process');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "MyPassLittleSceret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1800000,
    expires: new Date(Date.now() + 1800000)
  }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDataBase", {useNewUrlParser:true});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema( {
  name: String,
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secret",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// app.use(session({
//   secret: "MyStrongSecretPassword",
//   resave: false,
//   saveUninitialized: false
// }));
//
//
// app.use(passport.initialize());
// app.use(passport.session());

// app.get("/", (req, res) => {
//   res.render("home");
// });

app.get("/", (req, res) => {
  console.log("Currently not developed");
});



app.get("/auth/google", (req, res) => {
  return passport.authenticate("google", { scope: ["profile"] })(req, res);
});


app.get("/auth/google/secret",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/home");
  });

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});

app.get("/diagnosis", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("diagnosis");
  } else {
    res.redirect("/login");
  }
});

app.get("/consultancy", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("consultancy");
  } else {
    res.redirect("/login");
  }
});

app.get("/doctors", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("doctors");
  } else {
    res.redirect("/login");
  }
});

// app.get("/predict", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.render("predict", { pred: "" });
//   } else {
//     res.redirect("/login");
//   }
// });

app.get("/predict", (req, res, next) => {
  res.render("predict", { pred: "" });
});


app.get("/logout", (req, res, next) => {
  req.logout((err)=> {
    if (err) {
       return next(err);
     }
    res.redirect('/login');
  });
});

app.post("/register", (req, res) => {

  User.register({name: req.body.name, username: req.body.username}, req.body.cpassword, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });
});

// app.post("/login", (req, res) => {
//
//   const user = new User({
//     username: req.body.username,
//     password: req.body.password
//   });
//
//   req.login(user, (err) => {
//     if(err){
//       console.log(err);
//     }else if(user){
//       passport.authenticate("local") (req, res, () => {
//         res.redirect("/home");
//       });
//     } else if(!user){
//       res.redirect("/login");
//     }
//   });
// });

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log(err);
    }

    if (!user) {
      return res.render("login", { error: "Invalid username or password" });
    }

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.redirect("/login");
      }else{
        res.redirect("/home");
      }

    });

  })(req, res);

});



// app.post("/login", async (req, res) => {
//
// });


// app.get("/diagnosis", (req, res) => {
//   res.render("diagnosis");
// });
//
// app.get("/consultancy", (req, res) => {
//   res.render("consultancy");
// });
//
// app.get("/doctors", (req, res) => {
//   res.render("doctors");
// });
//
// app.get("/predict", (req, res) => {
//     res.render("predict", { pred: "" });
// });

app.post("/predict", async (req, res) => {

try {

  const inputFeatures = [req.body.GENDER, req.body.AGE, req.body.SMOKING, req.body.BETEL,
    req.body.ALCOHOL, req.body.BAD_BREATH, req.body.SUDDEN_BLEEDING, req.body.READ_WHITE_PATCH,
    req.body.NECK_LUMP, req.body.PAIN, req.body.NUMBNESS, req.body.BURNING_SENSATION, req.body.PAINLESS_ULCERATION,
     req.body.SWALLOWING_DIFFICULTY, req.body.LOSS_APPETITE];


  let inputArray = [];
  let ageValue;

  for (let i = 0; i < inputFeatures.length; i++) {
    switch (inputFeatures[i]) {
      case "male":
        inputArray.push(1);
        break;

      case "female":
        inputArray.push(0);
        break;

      case "yes":
        inputArray.push(2);
        break;

      case "no":
        inputArray.push(1);
        break;

      default:
        ageValue = inputFeatures[i];
        ageValue = parseInt(ageValue, 10);
        inputArray.push(ageValue);
        break;
    }
  }

    const prediction = await predictUsingPythonScript(inputArray);

    const probabilityPercentage = Math.round(parseFloat(prediction) * 100) / 100;


    let predMessage = "";
    if (probabilityPercentage > 50) {
      predMessage = `You have a high chance of Oral Cancer, the probability is ${probabilityPercentage}%`;
    } else {
      predMessage = `You have a low chance of Oral Cancer, the probability is ${probabilityPercentage}%`;
    }

    res.render("predict", { pred: predMessage });

    console.log('Response sent:', probabilityPercentage);
  } catch (error) {
    console.error('Error making prediction:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Implement a function to make predictions using the Python script
function predictUsingPythonScript(inputArray) {
  return new Promise((resolve, reject) => {

    const inputArrayString = JSON.stringify(inputArray);

    const pythonProcess = spawn('C:\\Users\\HIMASHA\\AppData\\Local\\Programs\\Python\\Python311\\python.exe', [
      'C:\\Users\\HIMASHA\\desktop\\Oral_Cancer_Predictor\\predict.py',
      inputArrayString
    ]);

    let result = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Error making prediction:', data.toString());
      reject(new Error('Error making prediction'));
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const predictionResult = JSON.parse(result);
          console.log('Prediction Result:', predictionResult);
          resolve(predictionResult);
        } catch (jsonError) {
          console.error('Error parsing JSON result:', jsonError);
          reject(jsonError);
        }
      } else {
        console.error('Python script exited with code', code);
        reject(new Error('Python script exited with code ' + code));
      }
    });
  });
}

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

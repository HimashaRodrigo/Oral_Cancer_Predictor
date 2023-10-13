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


const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  googleId: String,
  predictions: [
    {
      gender: String,
      age: String,
      smoking: String,
      betel: String,
      alcohol: String,
      bad_breath: String,
      sudden_bleeding: String,
      read_white_patch: String,
      neck_lump: String,
      pain: String,
      numbness: String,
      burning_sessation: String,
      painless_ulceration: String,
      sawallowing_difficulty: String,
      loss_appetite: String,
      predictionResult: String
    }
  ]
});

// const userSchema = new mongoose.Schema( {
//   name: String,
//   username: String,
//   password: String
// });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

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

// app.get("/auth/google/secret",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   async function(req, res) {
//     try {
//       const profile = req.user;
//
//       const user = await User.findOne({ googleId: profile.id });
//
//       if (user) {
//         res.redirect("/login");
//       } else {
//         res.redirect("/home");
//       }
//     } catch (err) {
//       console.error("Error checking if user exists:", err);
//       res.redirect("/login");
//     }
//   });

// app.get("/auth/google/secret",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   async function(req, res) {
//     try {
//       const profile = req.user;
//
//       // Find or create the user based on the Google ID
//       const user = await User.findOrCreate({ googleId: profile.id }, function(err, user) {
//         return user;
//       });
//
//       res.redirect("/home");
//     } catch (err) {
//       console.error("Error finding or creating user:", err);
//       res.redirect("/login");
//     }
//   });




app.get("/login", (req, res) => {
  res.render("login",  { error: "" });
});

app.get("/register", (req, res) => {
  // res.render("register");
  res.render("register", { errorMessage: "" });
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

app.get("/predict", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("predict", { pred: "" });
  } else {
    res.redirect("/login");
  }
});

// app.get("/predict", (req, res, next) => {
//   res.render("predict", { pred: "" });
// });

// app.get("/results", (req, res) => {
//   // Assuming you have the logged-in user available in the request object
//   const user = req.user;
//
//   // Render the table page and pass the user object to it
// res.render('results', { user: { predictions: userPredictions } });
//
// });

// Route to render the results page
// app.get('/results', (req, res) => {
//   // Ensure the user is logged in before rendering the results
//   if (!req.isAuthenticated()) {
//     return res.redirect('/login'); // Redirect to login if not authenticated
//   }
//
//   // Render the results.ejs template with the user's predictions data
//   // console.log(locals.user);
//   res.render('results', { user: res.locals.user });
// });

// Route to render the results page
app.get('/results', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.user._id);

    res.render('results', { user });
  } catch (error) {
    console.error('Error loading user data:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get("/logout", (req, res, next) => {
  req.logout((err)=> {
    if (err) {
       return next(err);
     }
    res.redirect('/login');
  });
});

// app.post("/register", async (req, res) => {
//
//   try {
//
//       const existingUser = await User.findOne({ username: req.body.username });
//
//       if (existingUser) {
//         return res.render("register", { errorMessage: "User with this email already exists" });
//       }
//
//     User.register({name: req.body.name, username: req.body.username}, req.body.cpassword, function(err, user){
//       if(err){
//         console.log(err);
//         res.redirect("/register");
//       }else{
//         passport.authenticate("local")(req, res, function(){
//           res.redirect("/home");
//         });
//       }
//     });
//   }catch{
//     console.error('Error during registration:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res.render("register", { errorMessage: "⚠️ You are already registered, please login" });
    }

    User.register({ name: req.body.name, username: req.body.username }, req.body.cpassword, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register", { errorMessage: "" });
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/home");
        });
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
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
      return res.render("login", { error: "⚠️ You enterd credential are invalid" });
    }

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.redirect("/login", { error: "" });
      }else{
        res.redirect("/home");
      }

    });

  })(req, res);

});


app.post('/delete-prediction/:predictionId', async (req, res) => {
  if (req.isAuthenticated()) {
    const predictionId = req.params.predictionId;

    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      const predictionIndex = user.predictions.findIndex(pred => pred._id.toString() === predictionId);
      if (predictionIndex !== -1) {
        user.predictions.splice(predictionIndex, 1);
        await user.save();
      } else {
        console.error('Prediction not found for deletion');
      }

      res.redirect('/results');
    } catch (error) {
      console.error('Error deleting prediction:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/login');
  }
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


    // Save prediction details to the database
   const predictionDetails = {
     gender: req.body.GENDER,
     age: req.body.AGE,
     smoking: req.body.SMOKING,
     betel: req.body.BETEL,
     alcohol: req.body.ALCOHOL,
     bad_breath: req.body.BAD_BREATH,
     sudden_bleeding: req.body.SUDDEN_BLEEDING,
     read_white_patch: req.body.READ_WHITE_PATCH,
     neck_lump: req.body.NECK_LUMP,
     pain: req.body.PAIN,
     numbness: req.body.NUMBNESS,
     burning_sessation: req.body.BURNING_SENSATION,
     painless_ulceration: req.body.PAINLESS_ULCERATION,
     sawallowing_difficulty: req.body.SWALLOWING_DIFFICULTY,
     loss_appetite: req.body.LOSS_APPETITE,
     predictionResult: probabilityPercentage + "%"
   };


    req.user.predictions.push(predictionDetails);
    await req.user.save();

    res.render("predict", { pred: predMessage, probabilityPercentage: probabilityPercentage });


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

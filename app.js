const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { spawn } = require('child_process');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/diagnosis", (req, res) => {
  res.render("diagnosis");
});

app.get("/consultancy", (req, res) => {
  res.render("consultancy");
});

app.get("/doctors", (req, res) => {
  res.render("doctors");
});

app.get("/predict", (req, res) => {
  res.render("predict", { pred: "" });
});

app.post("/predict", async (req, res) => {
  try {

    const inputFeatures = [
      parseInt(req.body.GENDER),
      parseInt(req.body.AGE),
      parseInt(req.body.SMOKING),
      parseInt(req.body.BETEL),
      parseInt(req.body.ALCOHOL),
      parseInt(req.body.BAD_BREATH),
      parseInt(req.body.SUDDEN_BLEEDING),
      parseInt(req.body.READ_WHITE_PATCH),
      parseInt(req.body.NECK_LUMP),
      parseInt(req.body.PAIN),
      parseInt(req.body.NUMBNESS),
      parseInt(req.body.BURNING_SENSATION),
      parseInt(req.body.PAINLESS_ULCERATION),
      parseInt(req.body.SWALLOWING_DIFFICULTY),
      parseInt(req.body.LOSS_APPETITE)
    ];

    const inputArray = inputFeatures;

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

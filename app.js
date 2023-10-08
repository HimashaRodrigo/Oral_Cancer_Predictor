const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { PythonShell } = require('python-shell');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
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
  res.render("predict");
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});

const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const passwordHash = require('password-hash');

const app = express();
const port = process.env.PORT || 3000;

app.use( express.static( "views"));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.get('/home', function (req, res) {
  res.sendFile(__dirname + "/public/" + "home.html");
});

app.get('/signup', function (req, res) {
  res.sendFile(__dirname + "/public/" + "signup.html");
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + "/public/" + "login.html");
});

app.get('/logopage', function (req, res) {
  res.render("logo");
  //res.sendFile(__dirname + "/public/" + "corona.html");
});

app.post('/signsubmit', function (req, res) {
  const { username, email, password} = req.body;
  db.collection("company")
    .where("Email", "==", email)
    .get()
    .then((docs) => {
      if (!docs.empty) {
        res.send("<center><h1>Hey, this account already exists with this email</h1></center>");
      } else {
        const hashedPassword = passwordHash.generate(password);
        db.collection('company').add({
          Username: username,
          Email: email,
          Password: hashedPassword
        })
          .then(() => {
            res.send("<center><h1>SIGNUP  IS  SUCCESSFUL PLEASE <a href='/login'>LOGIN HERE</a></h1></center>");
          })
          .catch(() => {
            res.send("Something went wrong");
          });
      }
    })
    .catch(() => {
      res.send("Something went wrong");
    });
});
app.post('/logsubmit', function (req, res) {
  const { email, password } = req.body;
  let dataPres = false;

  db.collection('company').get()
    .then((docs) => {
      docs.forEach((doc) => {
        if (email == doc.data().Email && passwordHash.verify(password, doc.data().Password)) {
          dataPres = true;
        }
      });

      if (dataPres) {
        res.send("<h2>GIVEN DATA PRESENT IN FIREBASE AND CLICK HERE FOR THE <a href='/logopage'>COVID CASES</a></h2>");
      } else {
        res.send("<h2>DATA NOT PRESENT IN FIREBASE, PLEASE LOGIN</h2>");
      }
    })
    .catch(() => {
      res.send("Something went wrong");
    });
});

app.listen(port, function () {
  console.log(`Your server is running on http://localhost:${port}/home`);
});

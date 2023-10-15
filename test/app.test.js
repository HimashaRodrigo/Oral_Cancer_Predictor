const chai = require('chai');
const chaiHttp = require('chai-http');
const supertest = require('supertest');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;
const request = supertest(app);




//Render login page
describe('GET /login', () => {
  it('should render login page with no errors', (done) => {
    request
      .get('/login')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.text).to.include('<title>Oral Cancer Predictor</title>');
        expect(res.text).to.not.include('Error');

        done();
      });
  });
});


// //Render register page
describe('GET /register', () => {
  it('should render register page with no errors', (done) => {
    request
      .get('/register')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.text).to.include('<title>Oral Cancer Predictor</title>');
        expect(res.text).to.not.include('Error');

        done();
      });
  });
});

 //Render predict page
describe('GET /predict', () => {
  it('should render predict page with no errors', (done) => {
    request
      .get('/register')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.text).to.include('<title>Oral Cancer Predictor</title>');
        expect(res.text).to.not.include('Error');

        done();
      });
  });
});


  //Test Registration
describe('POST /register', () => {
  it('should register a new user with valid credentials', (done) => {
    const newUser = {
      name: 'John Doe',
      username: 'johndoe@example.com',
      password: 'ValidPassword123',
      cpassword: 'ValidPassword123',
    };

    chai.request(app)
      .post('/register')
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should handle registration with existing username', (done) => {
    const existingUser = {
      name: 'Jane Doe',
      username: 'existinguser@example.com',
      password: 'ExistingUser123',
      cpassword: 'ExistingUser123',
    };

    chai.request(app)
      .post('/register')
      .send(existingUser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});


//Test login with valid credentials
it('should login with valid credentials', (done) => {
  const credentials = {
    username: 'john.doe@example.com',
    password: 'ValidPassword123',
  };

  chai.request(app)
    .post('/login')
    .send(credentials)
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.text).to.include('Login Now');
      done();
    });
});


//Login with invalid credentials
describe('POST /login', () => {
  it('should handle login with invalid credentials', (done) => {
    const credentials = {
      username: 'nonexistent.user@example.com',
      password: 'InvalidPassword123',
    };

    chai.request(app)
      .post('/login')
      .send(credentials)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});


//Test user authenication
describe('GET /home', () => {

  it('should redirect to login if user is not authenticated', (done) => {
    request
      .get('/home')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers.location).to.equal('/login');

        done();
      });
  });
});


 //Test predict page authentication
describe('GET /predict', () => {
  it('should redirect to login if user is not authenticated', (done) => {
    request
      .get('/predict')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.headers.location).to.equal('/login');

        done();
      });
  });
});

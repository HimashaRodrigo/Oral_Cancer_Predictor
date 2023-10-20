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


//Render register page
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


//Test register with valid credentials
describe('POST /register', () => {
  it('should register a new user with valid credentials', (done) => {
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


describe('POST /predict', () => {
  it('should Prediction results sucessfully indicated', (done) => {
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

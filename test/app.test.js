const request = require('supertest');
const app = require('../app');
const { spawn } = require('child_process');

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

//login_page_render
describe('GET /login', () => {
  test('should render the login page with no errors', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Login');
  });
});


//register_page_render
describe('GET /register', () => {
  test('should render the register page with no errors', async () => {
    const response = await request(app).get('/register');

    expect(response.status).toBe(200);
    expect(response.text).toContain('register');
  });
});


//home_page_render
describe('GET /home', () => {
  test('should render the home page if user is authenticated', async () => {

    const response = await request(app).get('/home').set('Cookie', ['your-auth-cookie=valid']);

    expect(response.status).toBe(200);
    expect(response.text).toContain('home');
  });

  test('should redirect to /login if user is not authenticated', async () => {
    const response = await request(app).get('/home');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });
});


//predict_page_render
describe('GET /predict', () => {
  test('should render the predict page if user is authenticated', async () => {

    const response = await request(app).get('/predict').set('Cookie', ['your-auth-cookie=valid']);

    expect(response.status).toBe(200);
    expect(response.text).toContain('predict');
  });

  test('should redirect to /login if user is not authenticated', async () => {
    const response = await request(app).get('/predict');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });
});


//results_page_login
const request = require('supertest');
const app = require('../app');

describe('GET /results', () => {
  test('should render the results page if user is authenticated', async () => {

    const authenticatedAgent = request.agent(app);
    await authenticatedAgent.post('/login').send({""});

    const response = await authenticatedAgent.get('/results');

    expect(response.status).toBe(200);

    expect(response.text).toContain('Results');
  });

  test('should redirect to /login if user is not authenticated', async () => {
    const response = await request(app).get('/results');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });
});


//registration_page_validate
describe('POST /register', () => {
  test('should render registration page with error message if user is already registered', async () => {

    const existingUser = { name: 'Test User', username: 'testuser', password: 'password123' };
    await User.create(existingUser);

    const response = await request(app)
      .post('/register')
      .send({
        name: 'New User',
        username: 'testuser@gmail.com',
        cpassword: 'newpassword123'
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain('You are already registered');
  });

  test('should redirect to /home after successful registration', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        name: 'New User',
        username: 'newuser@gmail.com',
        cpassword: 'password123'
      });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/home');
  });
});



//check_prediction_page_validate
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

describe('POST /predict', () => {
  test('should render predict page with prediction message', async () => {
    const mockPrediction = '0.75';
    spawn.mockImplementation(() => {
      const stdout = {
        on: (event, callback) => {
          if (event === 'data') {
            callback(mockPrediction);
          }
        },
      };
      const stderr = {
        on: jest.fn(),
      };
      const on = (event, callback) => {
        if (event === 'close') {
          callback(0);
        }
      };
      return { stdout, stderr, on };
    });

    const response = await request(app)
      .post('/predict')
      .send({
        GENDER: 'male',
        AGE: '25',
        SMOKING: 1,
        BETEL: 2,
        ALCOHOL: 2,
        BAD_BREATH: 2,
        SUDDEN_BLEEDING: 1,
        READ_WHITE_PATCH: 2,
        NECK_LUMP: 1,
        PAIN: 2,
        NUMBNESS: 1,
        BURNING_SENSATION: 2,
        PAINLESS_ULCERATION: 1,
        SWALLOWING_DIFFICULTY: 1,
        LOSS_APPETITE: 2
      });

    expect(response.status).toBe(200);
    expect(response.text).toContain('Prediction Result');
    expect(response.text).toContain('75%');
  });

  test('should handle error during prediction', async () => {
    spawn.mockImplementation(() => {
      const stderr = {
        on: (event, callback) => {
          if (event === 'data') {
            callback('Error during prediction');
          }
        },
      };
      const on = (event, callback) => {
        if (event === 'close') {
          callback(1);
        }
      };
      return { stderr, on };
    });

    const response = await request(app)
      .post('/predict')
      .send({
        GENDER: 'male',
        AGE: '25',
        SMOKING: 1,
        BETEL: 2,
        ALCOHOL: 2,
        BAD_BREATH: 2,
        SUDDEN_BLEEDING: 1,
        READ_WHITE_PATCH: 2,
        NECK_LUMP: 1,
        PAIN: 2,
        NUMBNESS: 1,
        BURNING_SENSATION: 2,
        PAINLESS_ULCERATION: 1,
        SWALLOWING_DIFFICULTY: 1,
        LOSS_APPETITE: 2
      });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});

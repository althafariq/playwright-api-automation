const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const { login, register } = require('./helpers/apiHelper');

const ajv = new Ajv();

const successLoginData = {
    email: 'eve.holt@reqres.in',
    password: 'cityslicka',
};

const successRegisterData = {
  email: 'eve.holt@reqres.in',
  password: 'pistol',
};

test('(POST) Successful login will return token in response', async ({ request }) => {
  const responseData = await login(request, successLoginData, true);
  expect(responseData.token).toBeTruthy();
});


test('Validate JSON Schema after successful login', async ({ request }) => {
  const responseData = await login(request, successLoginData, true);

  const schema = {
    type: 'object',
    required: ['token'],
    properties: {
      token: { type: 'string' }
    }
  };

  const isValid = ajv.validate(schema, responseData);

  if (!isValid) {
    console.error('AJV validation failed:', ajv.errorsText());
  }

  expect(isValid).toBe(true);
});

test('(POST) Invalid login will return error message', async ({ request }) => {
  const data = {
    email: 'invalid@email.com',
    password: 'invalidpassword',
  };

  const response = await login(request, data, false);
  expect(response.error).toBe('user not found');
});

test('(POST) Blank email in login form will return error message', async ({ request }) => {
  const data = {
    email: '',
    password: 'cityslicka',
  };

  const response = await login(request, data, false);

  expect(response.error).toBe('Missing email or username');
});

test('(POST) Blank password in login form will return error message', async ({ request }) => {
  const data = {
    email: 'eve.holt@reqres.in',
    password: '',
  };

  const response = await login(request, data, false);

  expect(response.error).toBe('Missing password');
});

test('(POST) Successful register will return id and token in response', async ({ request }) => {
  const responseData = await register(request, successRegisterData, true);

  expect(responseData.id).toBeTruthy();
  expect(responseData.token).toBeTruthy();
});

test('Validate JSON Schema after successful register', async ({ request }) => {
  const responseData = await register(request, successRegisterData, true);

  const schema = {
    type: 'object',
    required: ['id', 'token'],
    properties: {
      id: { type: 'number' },
      token: { type: 'string' }
    }
  };

  const isValid = ajv.validate(schema, responseData);

  if (!isValid) {
    console.error('AJV validation failed:', ajv.errorsText());
  }

  expect(isValid).toBe(true);
});

test('(POST) Invalid register will return error message', async ({ request }) => {
  const data = {
    email: 'invalidemail',
    password: 'invalidpaswword',
  };

  const response = await register(request, data, false);
  expect(response.error).toBe('Note: Only defined users succeed registration');
});

test('(POST) Blank email in register form will return error message', async ({ request }) => {
  const data = {
    email: '',
    password: 'pistol',
  };

  const response = await register(request, data, false);

  expect(response.error).toBe('Missing email or username');
}); 

test('(POST) Blank password in register form will return error message', async ({ request }) => {
  const data = {
    email: 'eve.holt@reqres.in',
    password: '',
  };

  const response = await register(request, data, false);

  expect(response.error).toBe('Missing password');
});
const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const { fetchApiData, postApiData, updateApiData, deleteApiData } = require('./helpers/apiHelper');

const ajv = new Ajv();

test('Validate JSON Schema', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users?page=2'); 

  const schema = require('./schemas/users.json');
  const isValid = ajv.validate(schema, responseData);

  if (!isValid) {
    console.error('AJV validation failed:', ajv.errorsText());
  }

  expect(isValid).toBe(true);
});

test('(GET) Response not empty', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users?page=2');
  expect(responseData.data.length).toBeGreaterThan(0); 
});

test('(GET) Response data contains id, email, first_name, last_name, avatar', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users?page=2');
  const user = responseData.data[0];

  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('first_name');
  expect(user).toHaveProperty('last_name');
  expect(user).toHaveProperty('avatar');
});

test('(GET) Response data contains correct email', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users?page=2');
  const user = responseData.data[0];

  expect(typeof user.email).toBe('string');
  expect(user.email).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
});

test('(GET) Response data contains correct avatar', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users?page=2');
  const user = responseData.data[0];

  expect(typeof user.avatar).toBe('string');
  expect(user.avatar).toMatch(/^https:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp|svg)$/);
});

test('(GET) Response data id is integer', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users?page=2');
  const user = responseData.data[0];

  expect(Number.isInteger(user.id)).toBe(true);
});

test('(GET) /users/$id returns correct data', async ({ request }) => {
  const responseData = await fetchApiData(request, '/users/2');
  expect(responseData.data.id).toBe(2);
  expect(responseData.data.email).toBe('janet.weaver@reqres.in');
  expect(responseData.data.first_name).toBe('Janet');
  expect(responseData.data.last_name).toBe('Weaver');
  expect(responseData.data.avatar).toBe('https://reqres.in/img/faces/2-image.jpg');
});

test('(POST) Create user success will returns correct properties', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);
  expect(responseData).toHaveProperty('name');
  expect(responseData).toHaveProperty('job');
  expect(responseData).toHaveProperty('id');
  expect(responseData).toHaveProperty('createdAt');
});

test('(POST) Validate JSON schema after successful create', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);

  const schema =
  {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "job": { "type": "string" },
      "id": { "type": "string" },
      "createdAt": { "type": "string" }
    },
    "required": ["name", "job", "id", "createdAt"]
  }

  const isValid = ajv.validate(schema, responseData);

  if (!isValid) {
    console.error('AJV validation failed:', ajv.errorsText());
  }

  expect(isValid).toBe(true);
});

test('(POST) Create user success will returns correct data', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);
  expect(responseData.name).toBe(data.name);
  expect(responseData.job).toBe(data.job);
});

test('(POST) Create user success will return correct createdAt format', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);
  const createdAt = new Date(responseData.createdAt);

  expect(createdAt.toString()).not.toBe('Invalid Date');
});

test('(PUT) /users/$id returns correct user data', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);

  const updateData = {
    name: 'morpheus',
    job: 'zion resident',
  };

  const updatedData = await updateApiData(request, `/users/${responseData.id}`, updateData);
  expect(updatedData.name).toBe(updateData.name);
  expect(updatedData.job).toBe(updateData.job);
});


test('(PUT) Validate JSON schema after successful update', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);

  const updateData = {
    name: 'morpheus',
    job: 'zion resident',
  };

  const updatedData = await updateApiData(request, `/users/${responseData.id}`, updateData);

  const schema = 
  {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "job": { "type": "string" },
      "updatedAt": { "type": "string" }
    },
    "required": ["name", "job", "updatedAt"]
  }
  
  const isValid = ajv.validate(schema, updatedData);
  
  if (!isValid) {
    console.error('AJV validation failed:', ajv.errorsText());
  }

  expect(isValid).toBe(true);
});

test('(PUT) /users/$id returns correct updatedAt format', async ({ request }) => {
  const data = {
    name: 'morpheus',
    job: 'leader',
  };

  const responseData = await postApiData(request, '/users', data, true);

  const updateData = {
    name: 'morpheus',
    job: 'zion resident',
  };

  const updatedData = await updateApiData(request, `/users/${responseData.id}`, updateData);
  const updatedAt = new Date(updatedData.updatedAt);

  expect(updatedAt.toString()).not.toBe('Invalid Date');
});

test('(DELETE) /users/$id returns 204 status', async ({ request }) => {
  const responseData = await deleteApiData(request, '/users/2');
  expect(responseData).toBe(undefined);
});

test('(DELETE) non-existing /users/$id returns 404 status', async ({ request }) => {
  try {
    await deleteApiData(request, '/users/99');
  } catch (error) {
    expect(error.message).toBe('Request failed with status code 404');
    expect(error.response.status()).toBe(404);
  }
});

test('(DELETE) /users/$id with invalid format returns 404 status', async ({ request }) => {
  try {
    await deleteApiData(request, '/users/invalid');
  } catch (error) {
    expect(error.message).toBe('Request failed with status code 404');
    expect(error.response.status()).toBe(404);
  }
});
const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const { fetchApiData } = require('./helpers/apiHelper');

const ajv = new Ajv();

test('Validate JSON Schema', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown'); 

  const schema = require('./schemas/resources.json');
  const isValid = ajv.validate(schema, responseData);

  if (!isValid) {
    console.error('AJV validation failed:', ajv.errorsText());
  }

  expect(isValid).toBe(true);
  // console.log(responseData);
});

test('(GET) Response not empty', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  expect(responseData.data.length).toBeGreaterThan(0); 
});

test('(GET) Response data contains id, name, year, color, pantone_value', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const resource = responseData.data[0];

  expect(resource).toHaveProperty('id');
  expect(resource).toHaveProperty('name');
  expect(resource).toHaveProperty('year');
  expect(resource).toHaveProperty('color');
  expect(resource).toHaveProperty('pantone_value');
});

test('(GET) Response data contains correct page', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const resource = responseData.page;

  expect(typeof resource).toBe('number');
  expect(resource).toBe(1);
});

test('(GET) Each color property has a valid hex value', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const hexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  responseData.data.forEach(resource => {
    expect(resource.color).toMatch(hexColor);
  });
});

test('(GET) id property should be unique', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const ids = new Set();

  responseData.data.forEach(resource => {
    expect(ids.has(resource.id)).toBe(false);
    ids.add(resource.id);
  });
});

test('(GET) year property should be a number', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');

  responseData.data.forEach(resource => {
    expect(typeof resource.year).toBe('number');
  });
});

test('(GET) name property should be a string', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');

  responseData.data.forEach(resource => {
    expect(typeof resource.name).toBe('string');
  });
});

test('(GET) pantone_value property should be a string', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');

  responseData.data.forEach(resource => {
    expect(typeof resource.pantone_value).toBe('string');
  });
});

test('(GET) endpoint /unknown/$id returns correct data', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown/2');
  expect(responseData.data.id).toBe(2);
  expect(responseData.data.name).toBe('fuchsia rose');
  expect(responseData.data.year).toBe(2001);
  expect(responseData.data.color).toBe('#C74375');
  expect(responseData.data.pantone_value).toBe('17-2031');
});

test('(GET) non-existing id returns 404', async ({ request }) => {
  const response = await request.get('https://reqres.in/api/unknown/23');
  expect(response.status()).toBe(404);
});




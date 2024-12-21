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

test('Response not empty', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  expect(responseData.data.length).toBeGreaterThan(0); 
});

test('Response data contains id, name, year, color, pantone_value', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const resource = responseData.data[0];

  expect(resource).toHaveProperty('id');
  expect(resource).toHaveProperty('name');
  expect(resource).toHaveProperty('year');
  expect(resource).toHaveProperty('color');
  expect(resource).toHaveProperty('pantone_value');
});

test('Response data contains correct page', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const resource = responseData.page;

  expect(typeof resource).toBe('number');
  expect(resource).toBe(1);
});

test('Each color property has a valid hex value', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const hexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  responseData.data.forEach(resource => {
    expect(resource.color).toMatch(hexColor);
  });
});

test('id property should be unique', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');
  const ids = new Set();

  responseData.data.forEach(resource => {
    expect(ids.has(resource.id)).toBe(false);
    ids.add(resource.id);
  });
});

test('year property should be a number', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');

  responseData.data.forEach(resource => {
    expect(typeof resource.year).toBe('number');
  });
});

test('name property should be a string', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');

  responseData.data.forEach(resource => {
    expect(typeof resource.name).toBe('string');
  });
});

test('pantone_value property should be a string', async ({ request }) => {
  const responseData = await fetchApiData(request, '/unknown');

  responseData.data.forEach(resource => {
    expect(typeof resource.pantone_value).toBe('string');
  });
});




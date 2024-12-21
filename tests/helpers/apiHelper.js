const { expect } = require('@playwright/test');

const baseURL = 'https://reqres.in/api';

async function fetchApiData(request, endpoint) {
  const response = await request.get(`${baseURL}${endpoint}`);
  expect(response.status()).toBe(200);
  return await response.json();
}

async function postApiData(request, endpoint, data) {
  const header = {
    Accept: 'application/json',
  }

  const response = await request.post(`${baseURL}${endpoint}`, {
    headers: header,
    data: data
  });

  const responseBody = await response.json();

  // Debug response details
  console.log('Response:', responseBody);

  // Validate response status
  expect(response.status()).toBe(201);
  return responseBody;
}

async function updateApiData(request, endpoint, data) {
  const header = {
    Accept: 'application/json',
  }

  const response = await request.put(`${baseURL}${endpoint}`, {
    headers: header,
    data: data
  });

  const responseBody = await response.json();

  // Debug response details
  console.log('Response:', responseBody);

  // Validate response status
  expect(response.status()).toBe(200);
  return responseBody;
}

async function deleteApiData(request, endpoint) {
  const response = await request.delete(`${baseURL}${endpoint}`);
  expect(response.status()).toBe(204);
}


module.exports = { fetchApiData, postApiData, updateApiData, deleteApiData };
/*  Integration tests for API endpoints
    Currently done:
        login
        register
        joingroup
        addgroup
        searchgroup
*/

// Supertest is a testing library used to test APIs.
const request = require('supertest');

require('dotenv').config({path:'../.env'});

// Importing the app and server objects from server.js.
const {app, server} = require("./server");

// Connection for Mongodb.
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

// Before doing any tests, connects to the Mongodb database.
beforeAll(async () => {
    await client.connect();
});

// After all of the tests are completed, disconnects from the Mongodb database and closes the server listening on port 5000.
afterAll(async () => {
    await client.close();
    server.close();
});

describe('POST /api/addgroup', () => {
    it('should add a group', async () => {
        
        const testGroup = {
            Class: 'JestTestClass',
            name: 'Test Group',
            owner: 1,
            expiry: '2024-12-31',
            link: 'https://example.com',
            modality: 'Online',
            description: 'A Jest test group',
            students: []
        };

        const response = await request(app).post('/api/addgroup').send(testGroup);
        expect(response.status).toBe(200);

    });
});

describe('POST /api/joingroup', () => {
    it("should put the user's id in the group's student array and put the group's name in the user's group's array", async () => {

        const testJoinGroup = {
            userId: 1,
            name: 'Test Group'
        };

        const response = await request(app).post('/api/joingroup').send(testJoinGroup);
        expect(response.status).toBe(200);

    });
});

describe('POST /api/searchgroups', () => {
    it("should search for groups with the given class code", async () => {

        const testSearch = {
            userId: 1,
            search: 'JestTestClass'
        };

        const response = await request(app).post('/api/searchgroups').send(testSearch);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBeGreaterThan(0);
        console.log(response.body.results);

    });
});

describe('POST /api/register', () => {
    it("should add a user to the user's database", async () => {

        const testRegister = {
            FirstName: "JestFN",
            LastName: "JestLN",
            DisplayName: "JestDN",
            Email: "JestTest@email.com",
            Password: "JestPassword"
        };

        const response = await request(app).post('/api/register').send(testRegister);
        expect(response.status).toBe(200);

    });
});

describe('POST /api/login', () => {
    it("should log the user in", async () => {

        const testLogin = {
            Email: 'JestTest@email.com',
            Password: 'JestPassword'
        };

        const response = await request(app).post('/api/login').send(testLogin);
        console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body.id).not.toBe(-1);

    });
});


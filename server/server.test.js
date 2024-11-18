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
            Name: 'Test Group',
            Owner: 1,
            Link: 'https://example.com',
            Modality: 'Online',
            Description: 'A Jest test group',
            Size: 100,
            Location: "Discord",
            MeetingTime: "10:30"
        };

        const response = await request(app).post('/api/addgroup').send(testGroup);
        expect(response.status).toBe(200);

    });
});

describe('POST /api/joingroup', () => {
    it("should put the user's id in the group's student array and put the group's id in the user's group array", async () => {

        const testJoinGroup = {
            UserId: 1,
            GroupId: 26
        };

        const response = await request(app).post('/api/joingroup').send(testJoinGroup);
        expect(response.status).toBe(200);

    });
});

describe('POST /api/searchgroups', () => {
    it("should search for groups with the given class code", async () => {

        const testSearch = {
            UserId: 1,
            Search: 'JestTestClass'
        };

        const response = await request(app).post('/api/searchgroups').send(testSearch);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBeGreaterThan(0);
        console.log(response.body.results);

    });
});

describe('POST /api/register', () => {
    it("should add a user to the users database", async () => {

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
    it("should log the user in if user exists in users database", async () => {

        const testLogin = {
            Email: 'JestTest@email.com',
            Password: 'JestPassword'
        };

        const response = await request(app).post('/api/login').send(testLogin);
        console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body.UserId).not.toBe(-1);

    });
});


const request = require('supertest')
const app = require('../db/app.js')
const seed = require('../db/seeds/seed.js')
const testData = require('../db/data/test-data/index.js')
const db = require('../db/connection.js')

beforeEach(() => {
    return seed(testData)
})

afterAll(() => {
    if (db.end) db.end();
})

describe('news-project', () => {

    describe('api/topics', () => {
        test('GET: 200 - a get request should response with status 200', () => {
            return request(app).get('/api/topics').expect(200)
        })
        
        test('GET: 200 - a get request should return an array of topic objects', () => {
            return request(app).get('/api/topics').expect(200)
            .then(({body : {topics}}) => {
                expect(topics.length).toBeGreaterThan(0)
                expect(topics).toBeInstanceOf(Array);
                topics.forEach(topic => {
                    expect(topic).toBeInstanceOf(Object);
                })
            })
        })

        test('GET: 200 - a get request should return array of objects, which have "slug" and "description" properties', () => {
            return request(app).get('/api/topics').expect(200)
            .then(({body : {topics}}) => {
                topics.forEach(topic => {
                    expect(topic).toHaveProperty('slug', expect.any(String));
                    expect(topic).toHaveProperty('description', expect.any(String));
                })
            })
        })
    })
})
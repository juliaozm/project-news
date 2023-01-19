const request = require('supertest')
const app = require('../app.js')
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

    describe('/api/articles', () => {
        test('GET: 200 - a get request should response with status 200', () => {
            return request(app).get('/api/articles').expect(200);
        })

        test('GET: 200 - a get request should return array of article objects', () => {
            return request(app).get('/api/articles').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBeGreaterThan(0);
                expect(articles).toBeInstanceOf(Array);
                articles.forEach(article => {
                    expect(article).toBeInstanceOf(Object);
                })
            })
        })

        test('GET: 200 - a get request should return array of objects with following article properties', () => {
            return request(app).get('/api/articles').expect(200)
            .then(({body: {articles}}) => {
                articles.forEach(article => {
                    expect(article).toHaveProperty('author', expect.any(String));
                    expect(article).toHaveProperty('title', expect.any(String));
                    expect(article).toHaveProperty('article_id', expect.any(Number));
                    expect(article).toHaveProperty('topic', expect.any(String));
                    expect(article).toHaveProperty('created_at', expect.any(String));
                    expect(article).toHaveProperty('votes', expect.any(Number));
                    expect(article).toHaveProperty('article_img_url', expect.any(String));
                })
            })
        })

        test('GET: 200 - a get request should return array of objects with a new property "comment_count"', () => {
            return request(app).get('/api/articles').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBeGreaterThan(0);
                articles.forEach(article => {
                    expect(article).toHaveProperty('comment_count', expect.any(String));
                })
            })
        })

        test('GET: 200 - a get request should return array of objects which is by default sorted by "created_at" in a DESC order', () => {
            return request(app).get('/api/articles').expect(200)
            .then(({body: {articles}}) => {
                expect(articles[0]).toHaveProperty('created_at', '2020-11-03T09:12:00.000Z')
                expect(articles[articles.length - 1]).toHaveProperty('created_at', '2020-01-07T14:08:00.000Z')
            })
        })
    })

    describe('GET: /api/articles/:article_id', () => {
        test('GET: 200 - a get request should response with status 200', () => {
            return request(app).get('/api/articles/2').expect(200);
        })

        test('GET: 200 - a get request should return an article object', () => {
            return request(app).get('/api/articles/2').expect(200)
            .then(({body: {article}}) => {
                expect(article).toBeInstanceOf(Object);
            })
        })

        test('GET: 200 - a get request should return an object with following properties', () => {
            return request(app).get('/api/articles/5').expect(200)
            .then(({body: {article}}) => {
                expect(article).toEqual(expect.objectContaining({
                    author : expect.any(String),
                    title : expect.any(String),
                    article_id : expect.any(Number),
                    body : expect.any(String),
                    topic : expect.any(String),
                    created_at : expect.any(String),
                    votes : expect.any(Number),
                    article_img_url : expect.any(String)
                }))
               
            })
        })

        test('GET: 404 - returns a message "Not Found" when "article_id" does not exist', () => {
            return request(app).get('/api/articles/100').expect(404)
            .then(({body : {message}}) => {
                expect(message).toEqual('Not Found')
            })
        })

        test('GET: 400 - returns a message "Bad Request" when a bad "article_id" is passed', () => {
            return request(app).get('/api/articles/notAnumber').expect(400)
            .then(({body : {message}}) => {
                expect(message).toEqual('Bad Request')
            })
        })
    })
})
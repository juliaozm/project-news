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

    describe('GET: /api/articles/:article_id/comments', () => {
        test('GET: 200 - a get request should response with status 200', () => {
            return request(app).get('/api/articles/1/comments').expect(200)
        })

        test('GET: 200 - a get request should return an array of comment objects', () => {
            return request(app).get('/api/articles/1/comments').expect(200)
            .then(({body: {comments}}) => {
                expect(comments.length).toBeGreaterThan(0);
                expect(comments).toBeInstanceOf(Array);
                comments.forEach(comment => expect(comment).toBeInstanceOf(Object));
            })
        })

        test('GET: 200 - a get request should return an array of objects with following properties', () => {
            return request(app).get('/api/articles/1/comments').expect(200)
            .then(({body: {comments}}) => {
                comments.forEach(comment => 
                    expect(comment).toEqual(expect.objectContaining({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: expect.any(Number)
                    }))
                );
            })
        })

        test('GET: 200 - a get request should return array of objects which is by default sorted by "created_at" in a DESC order', () => {
            return request(app).get('/api/articles/1/comments').expect(200)
            .then(({body: {comments}}) => {
                expect(comments).toBeSortedBy('created_at', { descending: true })
            })
        })

        test('GET: 404 - a get request should return a message "Not Found" if the article_id does not exist', () => {
            return request(app).get('/api/articles/2/comments').expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('Not Found');
            })
        })

        test('GET: 400 - a get request should return a message "Bad Request" when bad article_id passed', () => {
            return request(app).get('/api/articles/notAnId/comments').expect(400)
            .then(({body: {message}}) => {
               expect(message).toBe('Bad Request');
            })
        })
    })

    describe('POST: /api/articles/:article_id/comments', () => {
        test('POST: 201 - responses with a comment object if "username" exists in users database and "body" is valid', () => {
            const newComment = {
                username: 'icellusedkars',
                body: 'Great comment!'
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(201)
            .then(({body: {comment}}) => {
                expect(comment).toBeInstanceOf(Object);
            })
        })

        test('POST: 201 - responses with an object that cointains the following properties', () => {
            const newComment = {
                username: 'icellusedkars',
                body: 'Great comment!'
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(201)
            .then(({body: {comment}}) => {
                expect(comment).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    body: expect.any(String),
                    votes: expect.any(Number),
                    created_at: expect.any(Number),
                }));
            })
        })

        test('POST: 404 - returns a message "This user does not exist" when there is no such "username" in users database', () => {
            const newComment = {
                username: 'ololo',
                body: 'Great comment!'
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('This user does not exist');
            })
        })

        test('POST: 400 - returns a message "Bad request" when a received object is empty', () => {
            const newComment = {}
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request');
            })
        })

        test('POST: 400 - returns a message "Bad request" when a received object missing a required "body" property', () => {
            const newComment = {
                username: 'icellusedkars'
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request');
            })
        })

        test('POST: 400 - returns a message "Bad request" when a received object missing a required "username" property', () => {
            const newComment = {
                body: 'Great comment!'
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request');
            })
        })

        test('POST: 400 - returns a message "Bad request" when a received object has empty values', () => {
            const newComment = {
                username: '',
                body: ''
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request');
            })
        })
    })
})
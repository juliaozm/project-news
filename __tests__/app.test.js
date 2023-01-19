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
                expect(articles).toBeSortedBy('created_at', {descending: true})
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

        test('GET: 404 - returns a message if the article_id does not exist in the article database', () => {
            return request(app).get('/api/articles/10000/comments').expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('This article does not exist');
            })
        })

        test('GET: 400 - returns a message if a bad article_id is passed', () => {
            return request(app).get('/api/articles/notAnId/comments').expect(400)
            .then(({body: {message}}) => {
               expect(message).toBe('Bad Request');
            })
        })

        test('GET: 200 - returns an object with an empty array of comments if the article exists in the database but has no comments', () => {
            return request(app).get('/api/articles/2/comments').expect(200)
            .then(({body: {comments}}) => {
                expect(comments).toEqual([{
                    message: 'No comments associated with this article',
                    comments: []
                }]);
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

        test('POST: 201 - responses with a comment object that cointains the following properties when passed a valid request body', () => {
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

        test('POST: 201 - responses with a comment object that ignores any additional keys passed in a request body', () => {
            const newComment = {
                username: 'icellusedkars',
                body: 'Great comment!',
                greetings: 'Hello!',
                age: 32,
                city: 'London'
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

        test('POST: 400 - returns a message "Bad request" when a request body is empty', () => {
            const newComment = {}
            return request(app)
            .post('/api/articles/1/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request');
            })
        })

        test('POST: 400 - returns a message "Bad request" when a request body missing a required "body" property', () => {
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

        test('POST: 400 - returns a message "Bad request" when a request body missing a required "username" property', () => {
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

        test('POST: 400 - returns a message "Bad request" when a request body has empty values', () => {
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

        test('POST: 400 - returns a message "Bad request" when invalid article_id is passed', () => {
            const newComment = {
                username: 'icellusedkars',
                body: 'Great comment!'
            }
            return request(app)
            .post('/api/articles/notAnumber/comments')
            .send(newComment)
            .expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request');
            })
        })
    })

    describe('PATCH: /api/articles/:article_id', () => {
        test('PATCH: 200 - responses with an article object when passed a valid request body', () => {
            const votes = { inc_votes: 100 }
            return request(app).patch('/api/articles/3').send(votes).expect(200)
            .then(({body: {article}}) => {
                expect(article).toBeInstanceOf(Object);
                expect(article).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    votes: expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    created_at: expect.any(Number),
                    article_img_url: expect.any(String)
                }))
            })
        })

        test('PATCH: 200 - responses with an article object that ignores any additional keys passed in a request body', () => {
            const votes = { 
                inc_votes: 100,
                author_reputation: 'good',
                comments: 3,
            }
            return request(app).patch('/api/articles/1').send(votes).expect(200)
            .then(({body: {article}}) => {
                expect(article).toBeInstanceOf(Object);
                expect(article).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    votes: expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    created_at: expect.any(Number),
                    article_img_url: expect.any(String)
                }))
            })
        })

        test('PATCH: 200 - responses with an article object where "votes" property increased by 100', () => {
            const votes = { inc_votes: 100 }
            return request(app).patch('/api/articles/1').send(votes).expect(200)
            .then(({body: {article}}) => {
                expect(article).toEqual(expect.objectContaining({
                    article_id: 1,
                    votes: 100,
                }))
            })
        })

        test('PATCH: 200 - responses with an article object where "votes" property decreased by 5', () => {
            const votes = { inc_votes: -5 }
            return request(app).patch('/api/articles/4').send(votes).expect(200)
            .then(({body: {article}}) => {
                expect(article).toEqual(expect.objectContaining({
                    article_id: 4,
                    votes: -5,
                }))
            })
        })

        test('PATCH: 404 - returns a message "This article does not exist" when "article_id" not found in the articles database', () => {
            const votes = { inc_votes: 100 }
            return request(app).patch('/api/articles/1000').send(votes).expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('This article does not exist')
            })
        })

        test('PATCH: 400 - returns a message "Bad Request" when invalid "article_id" is passed', () => {
            const votes = { inc_votes: 100 }
            return request(app).patch('/api/articles/notANumber').send(votes).expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request')
            })
        })

        test('PATCH: 400 - returns a message "Bad Request" when request body is empty', () => {
            const votes = {}
            return request(app).patch('/api/articles/notANumber').send(votes).expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request')
            })
        })

        test('PATCH: 400 - returns a message "Bad Request" when "inc_votes" property is not a number', () => {
            let votes = {inc_votes: true}
            return request(app).patch('/api/articles/notANumber').send(votes).expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request')
            })
        })
    })

    describe('GET: /api/users', () => {
        test('GET: 200 - a get request should response with an array of user objects', () => {
            return request(app).get('/api/users').expect(200)
            .then(({body: {users}}) => {
                expect(users).toBeInstanceOf(Array);
                expect(users.length).toBeGreaterThan(0);
                users.forEach(user => {
                    expect(user).toBeInstanceOf(Object)
                })
            })
        })

        test('GET: 200 - a get request should response with an array of objects with following properties', () => {
            return request(app).get('/api/users').expect(200)
            .then(({body: {users}}) => {
                users.forEach(user => {
                    expect(user).toEqual(expect.objectContaining({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String)
                    }))
                })
            })
        })
    })

    describe('GET: /api/articles (queries)', () => {
        test('GET 200 - returs an array that is sorted by default by "created_at" and in DESC order with all articles', () => {
            return request(app).get('/api/articles').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBe(12)
                expect(articles).toBeSortedBy('created_at', {descending: true})
            })
        })

        test('GET 200 - returs an array that is sorted by "author" and by default in DESC order', () => {
            return request(app).get('/api/articles/?sort_by=author').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBe(12)
                expect(articles).toBeSortedBy('author', {descending: true})
            })
        })

        test('GET 200 - returs an array that is sorted by default by "created_at" and in ASC order', () => {
            return request(app).get('/api/articles/?order=asc').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBe(12)
                expect(articles).toBeSortedBy('created_at', {descending: false})
            })
        })

        test(`GET 200 - returs an array of the only objects where "topic" property is "mitch",
            and is sorted by dcefault by "created_at" and in DESC order`, () => {
            return request(app).get('/api/articles/?topic=mitch').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBe(11)
                expect(articles).toBeSortedBy('created_at', {descending: true})
                articles.forEach(article => {
                    expect(article).toHaveProperty('topic', 'mitch')
                })
            })
        })

        test(`GET 200 - returs an array of the only objects where "topic" property is "mitch", 
            and that are sorted by "author" and in ASC order`, () => {
            return request(app).get('/api/articles/?topic=mitch&sort_by=author&order=asc').expect(200)
            .then(({body: {articles}}) => {
                expect(articles.length).toBe(11)
                expect(articles).toBeSortedBy('author', {descending: false})
                articles.forEach(article => {
                    expect(article).toHaveProperty('topic', 'mitch')
                })
            })
        })

        test(`GET 400 - returns a message 'Bad Request' when "sort_by" and "order" are listed but not specified`, () => {
            return request(app).get('/api/articles/?sort_by&order').expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request')
            })
        })

        test(`GET 404 - returns a message 'Not Found' when "sort_by" specified by not existed value`, () => {
            return request(app).get('/api/articles/?sort_by=date').expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('Not Found')
            })
        })

        test(`GET 400 - returns a message 'Bad Request' when "order" is specified with an invalid input`, () => {
            return request(app).get('/api/articles/?order=desk').expect(400)
            .then(({body: {message}}) => {
                expect(message).toBe('Bad Request')
            })
        })


        test(`GET 404 - returns a message 'Not Found' when "topic" specified by not existed value`, () => {
            return request(app).get('/api/articles/?topic=dog').expect(404)
            .then(({body: {message}}) => {
                expect(message).toBe('Not Found')
            })
        })
    })

    describe('GET: /api/articles/:article_id  (added "comment count")', () => {
        test('GET: 200 - returns an object which contains a new added property "comment_count"', () => {
            return request(app).get('/api/articles/2').expect(200)
            .then(({body: {article}}) => {
                expect(article).toBeInstanceOf(Object);
                expect(article).toEqual(expect.objectContaining({
                    author : expect.any(String),
                    title : expect.any(String),
                    article_id : expect.any(Number),
                    body : expect.any(String),
                    topic : expect.any(String),
                    created_at : expect.any(String),
                    votes : expect.any(Number),
                    article_img_url : expect.any(String),
                    comment_count: expect.any(String),
                }))
            })
        })
    })
})
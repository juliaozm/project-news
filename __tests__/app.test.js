const request = require("supertest");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const jwt = require("jsonwebtoken");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  if (db.end) db.end();
});

const generateAccessToken = () => {
  const user = {
    email: "tickle122@gmail.com",
    username: "tickle122",
    avatar_url:
      "https://vignette.wikia.nocookie.net/mrmen/images/d/d6/Mr-Tickle-9a.png/revision/latest?cb=20180127221953",
  };
  const accessToken = process.env.ACCESS_TOKEN_SECRET;
  const options = {
    expiresIn: "15m",
  };
  return jwt.sign(user, accessToken, options);
};

const accessToken = generateAccessToken();

describe("news-project", () => {
  describe("api/topics", () => {
    test("GET: 200 - a get request should response with status 200", () => {
      return request(app).get("/api/topics").expect(200);
    });

    test("GET: 200 - a get request should return an array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics.length).toBeGreaterThan(0);
          expect(topics).toBeInstanceOf(Array);
          topics.forEach((topic) => {
            expect(topic).toBeInstanceOf(Object);
          });
        });
    });

    test('GET: 200 - a get request should return array of objects, which have "slug" and "description" properties', () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          topics.forEach((topic) => {
            expect(topic).toHaveProperty("slug", expect.any(String));
            expect(topic).toHaveProperty("description", expect.any(String));
          });
        });
    });
  });

  describe("/api/articles", () => {
    test("GET: 200 - a get request should response with status 200", () => {
      return request(app).get("/api/articles").expect(200);
    });

    test("GET: 200 - a get request should return array of article objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBeGreaterThan(0);
          expect(articles).toBeInstanceOf(Array);
          articles.forEach((article) => {
            expect(article).toBeInstanceOf(Object);
          });
        });
    });

    test("GET: 200 - a get request should return array of objects with following article properties", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(article).toHaveProperty("author", expect.any(String));
            expect(article).toHaveProperty("title", expect.any(String));
            expect(article).toHaveProperty("article_id", expect.any(Number));
            expect(article).toHaveProperty("topic", expect.any(String));
            expect(article).toHaveProperty("created_at", expect.any(String));
            expect(article).toHaveProperty("votes", expect.any(Number));
            expect(article).toHaveProperty(
              "article_img_url",
              expect.any(String)
            );
          });
        });
    });

    test('GET: 200 - a get request should return array of objects with a new property "comment_count"', () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBeGreaterThan(0);
          articles.forEach((article) => {
            expect(article).toHaveProperty("comment_count", expect.any(String));
          });
        });
    });

    test('GET: 200 - a get request should return array of objects which is by default sorted by "created_at" in a DESC order', () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
  });

  describe("GET: /api/articles/:article_id", () => {
    test("GET: 200 - a get request should response with status 200", () => {
      return request(app).get("/api/articles/2").expect(200);
    });

    test("GET: 200 - a get request should return an article object", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toBeInstanceOf(Object);
        });
    });

    test("GET: 200 - a get request should return an object with following properties", () => {
      return request(app)
        .get("/api/articles/5")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            })
          );
        });
    });

    test('GET: 404 - returns a message "Not Found" when "article_id" does not exist', () => {
      return request(app)
        .get("/api/articles/100")
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Not Found");
        });
    });

    test('GET: 400 - returns a message "Bad Request" when a bad "article_id" is passed', () => {
      return request(app)
        .get("/api/articles/notAnumber")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Bad Request");
        });
    });
  });

  describe("GET: /api/articles/:article_id/comments", () => {
    test("GET: 200 - a get request should response with status 200", () => {
      return request(app).get("/api/articles/1/comments").expect(200);
    });

    test("GET: 200 - a get request should return an array of comment objects", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBeGreaterThan(0);
          expect(comments).toBeInstanceOf(Array);
          comments.forEach((comment) => expect(comment).toBeInstanceOf(Object));
        });
    });

    test("GET: 200 - a get request should return an array of objects with following properties", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          comments.forEach((comment) =>
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: expect.any(Number),
              })
            )
          );
        });
    });

    test('GET: 200 - a get request should return array of objects which is by default sorted by "created_at" in a DESC order', () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("GET: 404 - returns a message if the article_id does not exist in the article database", () => {
      return request(app)
        .get("/api/articles/10000/comments")
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("This article does not exist");
        });
    });

    test("GET: 400 - returns a message if a bad article_id is passed", () => {
      return request(app)
        .get("/api/articles/notAnId/comments")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test("GET: 200 - returns an object with an empty array of comments if the article exists in the database but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([
            {
              message: "No comments associated with this article",
              comments: [],
            },
          ]);
        });
    });
  });

  describe("POST: /api/users", () => {
    test("POST: 201 - responses with a user object if a valid email and username dont't exist in the users database", () => {
      const newUser = {
        email: "example@gmail.com",
        username: "exampleuser",
        password: "Passwo22rd3122222",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if the validator trims leading and trailing whitespaces", () => {
      const newUser = {
        email: " iamuseriamuser@gmail.com ",
        username: " iamuseriamuser1 ",
        password: " Password123456 ",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if password has at least 1 uppercase, 1 lowercase, 1 number, and 8 characters long", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "Passwor1",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if password has special characters", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "Pass&423!2@#3$5%44^99*1",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if special characters, such as hyphens, underscores, or dots are in the email address", () => {
      const newUser = {
        email: "i.aaaam-us_er@gmail.com",
        username: "iamuseriamuser1",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if email has uppercase characters", () => {
      const newUser = {
        email: "IaaaamUs_er@gmail.com",
        username: "iamuseriamuser1",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if hyphen and dots are in domain of the email", () => {
      const newUser = {
        email: "iamuseriamuser1@examp-le.com",
        username: "iamuseriamuser1",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if subdomain in the email address", () => {
      const newUser = {
        email: "rogerrogermain@subdomain.example.com",
        username: "iamuseriamuser1",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - responses with a user object if username cointains underscores", () => {
      const newUser = {
        email: "iamuseriamuser1@example.com",
        username: "i_am_user",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 409 - responses with error if both valid email and username exist in the users database", () => {
      const newUser = {
        email: "rogersop@gmail.com",
        username: "rogersop",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).toBe("This user already exists");
        });
    });

    test("POST: 409 - responses with error if valid email exists in the users database", () => {
      const newUser = {
        email: "rogersop@gmail.com",
        username: "rogersop33",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).toBe("This email already exists");
        });
    });

    test("POST: 409 - responses with error if valid username exists in the users database", () => {
      const newUser = {
        email: "rogersop1222@gmail.com",
        username: "rogersop",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(409)
        .then(({ body: { message } }) => {
          expect(message).toBe("This username already exists");
        });
    });

    test("POST: 400 - responses with error if no username", () => {
      const newUser = {
        email: "ro4gersop1222@gmail.com",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - responses with error if no password", () => {
      const newUser = {
        email: "ro4gersop1222@gmail.com",
        username: "rogersop1222",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - responses with error if no email", () => {
      const newUser = {
        username: "ro4gersop1222",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - responses with error if email, password, and username are empty", () => {
      const newUser = {
        email: "",
        username: "",
        password: "",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - responses with error if username starts with an underscore character", () => {
      const newUser = {
        email: "ro4gersop1222@gmail.com",
        username: "_rogersop",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid username");
        });
    });

    test("POST: 400 - responses with error if username contains dot character", () => {
      const newUser = {
        email: "ro4gersop1222@gmail.com",
        username: "roge.rsop",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid username");
        });
    });

    test("POST: 400 - responses with error if username contains hyphen character", () => {
      const newUser = {
        email: "ro4gersop1222@gmail.com",
        username: "roge-rsop",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid username");
        });
    });

    test("POST: 400 - responses with error if username contains less than 8 characters", () => {
      const newUser = {
        email: "rogeroger@gmail.com",
        username: "roge",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid username");
        });
    });

    test("POST: 400 - responses with error if username contains uppercase characters", () => {
      const newUser = {
        email: "rogeroger@gmail.com",
        username: "RogerroGermain",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid username");
        });
    });

    test("POST: 400 - responses with error if email is without Top-Level Domain", () => {
      const newUser = {
        email: "gergerroro@example",
        username: "gergerroro",
        password: "Password12",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - responses with error if email without @ symbol", () => {
      const newUser = {
        email: "exampleexample.com",
        username: "rogerrogermain",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - responses with error if email local part (before the @) is missing", () => {
      const newUser = {
        email: "@example.com",
        username: "rogerrogermain",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - responses with error if email domain part (after the @)  is missing", () => {
      const newUser = {
        email: "rogerrogermain@",
        username: "rogerrogermain",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - responses with error if email is with multiple @ symbols", () => {
      const newUser = {
        email: "rogerrogermain@rogerrogermain@rogerrogermain.com",
        username: "rogerrogermain",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - responses with error if email is with underscore character in the domain part", () => {
      const newUser = {
        email: "rogerrogermain@exa_mple.com",
        username: "rogerrogermain",
        password: "Password123456",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - responses with error if password has only lowercase letters", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "passwordpassword",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid password");
        });
    });

    test("POST: 400 - responses with error if password has only uppercase letters", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "PSSWORDPASSWORD",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid password");
        });
    });

    test("POST: 400 - responses with error if password has only letters", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "1234567890",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid password");
        });
    });

    test("POST: 400 - responses with error if password has less than 8 characters", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "Pass12",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid password");
        });
    });

    test("POST: 400 - responses with error if password has 8 characters but no number", () => {
      const newUser = {
        email: "rogerrogermain@example.com",
        username: "rogerrogermain",
        password: "Password",
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid password");
        });
    });
  });

  describe("POST: /api/articles/:article_id/comments", () => {
    test('POST: 201 - responses with a comment object if "username" exists in users database and "body" is valid', () => {
      const newComment = {
        username: "icellusedkars",
        body: "Great comment!",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toBeInstanceOf(Object);
        });
    });

    test("POST: 201 - responses with a comment object that cointains the following properties when passed a valid request body", () => {
      const newComment = {
        username: "icellusedkars",
        body: "Great comment!",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(Number),
            })
          );
        });
    });

    test("POST: 201 - responses with a comment object that ignores any additional keys passed in a request body", () => {
      const newComment = {
        username: "icellusedkars",
        body: "Great comment!",
        greetings: "Hello!",
        age: 32,
        city: "London",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.any(Number),
            })
          );
          expect(comment).not.toEqual(
            expect.objectContaining({
              city: expect.anything(),
              greetings: expect.anything(),
              age: expect.anything(),
            })
          );
        });
    });

    test('POST: 404 - returns an error when there is no such "username" in users database', () => {
      const newComment = {
        username: "gooduser",
        body: "Great comment!",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("This user does not exist");
        });
    });

    test("POST: 400 - returns an error when a request body is empty", () => {
      const newComment = {};
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid data sent");
        });
    });

    test('POST: 400 - returns an error when a request body missing a required "body" property', () => {
      const newComment = {
        username: "icellusedkars",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid data sent");
        });
    });

    test('POST: 400 - returns an error when a request body missing a required "username" property', () => {
      const newComment = {
        body: "Great comment!",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid data sent");
        });
    });

    test("POST: 400 - returns an error when a request body has empty values", () => {
      const newComment = {
        username: "",
        body: "",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid data sent");
        });
    });

    test("POST: 400 - returns an error when invalid article_id is passed", () => {
      const newComment = {
        username: "icellusedkars",
        body: "Great comment!",
      };
      return request(app)
        .post("/api/articles/notAnumber/comments")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newComment)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid data sent");
        });
    });

    test("POST: 401 - returns an error when access token was not passed", () => {
      const newComment = {
        username: "icellusedkars",
        body: "Great comment!",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).toBe(
            "You aren't authentificated. Please login again"
          );
        });
    });
  });

  describe("PATCH: /api/articles/:article_id", () => {
    test("PATCH: 200 - responses with an article object when passed a valid request body", () => {
      const votes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/3")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toBeInstanceOf(Object);
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              votes: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(Number),
              article_img_url: expect.any(String),
            })
          );
        });
    });

    test("PATCH: 200 - responses with an article object that ignores any additional keys passed in a request body", () => {
      const votes = {
        inc_votes: 100,
        author_reputation: "good",
        comments: 3,
      };
      return request(app)
        .patch("/api/articles/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toBeInstanceOf(Object);
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              votes: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(Number),
              article_img_url: expect.any(String),
            })
          );
        });
    });

    test('PATCH: 200 - responses with an article object where "votes" property increased by 100', () => {
      const votes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: 1,
              votes: 100,
            })
          );
        });
    });

    test('PATCH: 200 - responses with an article object where "votes" property decreased by 5', () => {
      const votes = { inc_votes: -5 };
      return request(app)
        .patch("/api/articles/4")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: 4,
              votes: -5,
            })
          );
        });
    });

    test('PATCH: 404 - returns a message "This article does not exist" when "article_id" not found in the articles database', () => {
      const votes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/1000")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("This article does not exist");
        });
    });

    test('PATCH: 400 - returns a message "Bad Request" when invalid "article_id" is passed', () => {
      const votes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/notANumber")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test('PATCH: 400 - returns a message "Bad Request" when request body is empty', () => {
      const votes = {};
      return request(app)
        .patch("/api/articles/notANumber")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test('PATCH: 400 - returns a message "Bad Request" when "inc_votes" property is not a number', () => {
      let votes = { inc_votes: true };
      return request(app)
        .patch("/api/articles/notANumber")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(votes)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test("PATCH: 401 - responses with error when access token is not passed", () => {
      const votes = { inc_votes: -5 };
      return request(app)
        .patch("/api/articles/4")
        .send(votes)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).toBe(
            "You aren't authentificated. Please login again"
          );
        });
    });
  });

  describe("GET: /api/users", () => {
    test("GET: 200 - a get request should response with an array of user objects", () => {
      return request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users).toBeInstanceOf(Array);
          expect(users.length).toBeGreaterThan(0);
          users.forEach((user) => {
            expect(user).toBeInstanceOf(Object);
          });
        });
    });

    test("GET: 200 - a get request should response with an array of objects with following properties", () => {
      return request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)
        .then(({ body: { users } }) => {
          users.forEach((user) => {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                email: expect.any(String),
                avatar_url: expect.any(String),
              })
            );
            expect(user).not.toEqual(
              expect.objectContaining({
                password: expect.any(String),
                user_id: expect.any(String),
              })
            );
          });
        });
    });

    test("GET: 401 - a get request should return error when access token is not passed", () => {
      return request(app)
        .get("/api/users")
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).toBe(
            "You aren't authentificated. Please login again"
          );
        });
    });
  });

  describe("GET: /api/users/:email", () => {
    test("GET: 200 - a get request should return a user object with following properties", () => {
      const email = "butter_bridge@gmail.com";
      return request(app)
        .get(`/api/users/${email}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body.status).toBe(true);
          expect(body.message).toBe(`${email} exists`);
        });
    });

    test("GET: 200 - a get request should return a user object if the validator trims leading and trailing whitespaces", () => {
      const email = " butter_bridge@gmail.com ";
      return request(app)
        .get(`/api/users/${email}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body.status).toBe(true);
          expect(body.message).toBe(`${email.trim()} exists`);
        });
    });

    test("GET: 200 - returns a user object a message if special characters, such as hyphens, underscores, or dots are in the email address", () => {
      const email = "an.ony-mo_us@gmail.com";
      return request(app)
        .get(`/api/users/${email}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body.status).toBe(true);
          expect(body.message).toBe(`${email.trim()} exists`);
        });
    });
    test("GET: 200 - returns a user object a message if underscore and dots are in domain of the email address", () => {
      const email = "icellusedkars@examp-le.com";
      return request(app)
        .get(`/api/users/${email}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body.status).toBe(true);
          expect(body.message).toBe(`${email.trim()} exists`);
        });
    });

    test("GET: 200 - returns a user object a message with subdomain in the email address", () => {
      const email = "example@subdomain.example.com";
      return request(app)
        .get(`/api/users/${email}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body.status).toBe(true);
          expect(body.message).toBe(`${email.trim()} exists`);
        });
    });

    test('GET: 404 - returns a message "User Not Found" when email address does not exist', () => {
      return request(app)
        .get("/api/users/ano_nymo-us.11@gmai-l.com")
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toEqual("User Not Found");
        });
    });

    test('GET: 400 - returns a message "Invalid email" without Top-Level Domain', () => {
      return request(app)
        .get("/api/users/example@example")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Invalid email");
        });
    });

    test('GET: 400 - returns a message "Invalid email" without "@" symbol', () => {
      return request(app)
        .get("/api/users/exampleexample.com")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Invalid email");
        });
    });

    test('GET: 400 - returns a message "Invalid email" if the local part (before the "@") is missing', () => {
      return request(app)
        .get("/api/users/@example.com")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Invalid email");
        });
    });

    test('GET: 400 - returns a message "Invalid email" if a domain part (after the "@")  is missing', () => {
      return request(app)
        .get("/api/users/example@")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Invalid email");
        });
    });

    test('GET: 400 - returns a message "Invalid email" with multiple "@" symbols in the email address', () => {
      return request(app)
        .get("/api/users/example@example@example.com")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Invalid email");
        });
    });

    test('GET: 400 - returns a message "Invalid email" with underscore character in the domain part', () => {
      return request(app)
        .get("/api/users/example@exa_mple.com")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toEqual("Invalid email");
        });
    });
  });

  describe("GET: /api/articles (queries)", () => {
    test('GET 200 - returs an array that is sorted by default by "created_at" and in DESC order with all articles', () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });

    test('GET 200 - returs an array that is sorted by "author" and by default in DESC order', () => {
      return request(app)
        .get("/api/articles/?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("author", { descending: true });
        });
    });

    test('GET 200 - returs an array that is sorted by default by "created_at" and in ASC order', () => {
      return request(app)
        .get("/api/articles/?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("created_at", { descending: false });
        });
    });

    test(`GET 200 - returs an array of the only objects where "topic" property is "mitch",
            and is sorted by dcefault by "created_at" and in DESC order`, () => {
      return request(app)
        .get("/api/articles/?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("created_at", { descending: true });
          articles.forEach((article) => {
            expect(article).toHaveProperty("topic", "mitch");
          });
        });
    });

    test(`GET 200 - returs an array of the only objects where "topic" property is "mitch", 
            and that are sorted by "author" and in ASC order`, () => {
      return request(app)
        .get("/api/articles/?topic=mitch&sort_by=author&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
          expect(articles).toBeSortedBy("author", { descending: false });
          articles.forEach((article) => {
            expect(article).toHaveProperty("topic", "mitch");
          });
        });
    });

    test(`GET 400 - returns a message 'Bad Request' when "sort_by" and "order" are listed but not specified`, () => {
      return request(app)
        .get("/api/articles/?sort_by&order")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test(`GET 404 - returns a message 'Not Found' when "sort_by" specified by not existed value`, () => {
      return request(app)
        .get("/api/articles/?sort_by=date")
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Not Found");
        });
    });

    test(`GET 400 - returns a message 'Bad Request' when "order" is specified with an invalid input`, () => {
      return request(app)
        .get("/api/articles/?order=desk")
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test(`GET 404 - returns a message 'Not Found' when "topic" specified by not existed value`, () => {
      return request(app)
        .get("/api/articles/?topic=dog")
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Not Found");
        });
    });
  });

  describe("DELETE: /api/comments/:comment_id", () => {
    test('DELETE: 204 - status 204 and no content if "comment_id" exists', () => {
      return request(app)
        .delete("/api/comments/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(204);
    });

    test('DELETE: 404 - returns a message "Not Found" if "comment_id" does not exist in the database', () => {
      return request(app)
        .delete("/api/comments/1000")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Not Found");
        });
    });

    test('DELETE: 400 - returns a message "Bad Request" if invalid "comment_id" was passed', () => {
      return request(app)
        .delete("/api/comments/notAnumber")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Bad Request");
        });
    });

    test("DELETE: 401 - returns error when access token was not passed", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).toBe(
            "You aren't authentificated. Please login again"
          );
        });
    });
  });

  describe('GET: /api/articles/:article_id  (added "comment count")', () => {
    test('GET: 200 - returns an object which contains a new added property "comment_count"', () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toBeInstanceOf(Object);
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            })
          );
        });
    });
  });

  describe("GET: /api/articles (pagination)", () => {
    test("GET: 200 - returns an array with limited number of articles considering total_count is more than a limit number", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.total_count).toBeGreaterThan(10);
        });
    });

    test("GET: 200 - returns an array with 5 articles on the 1st page", () => {
      const limit = 5;
      const page = 1;
      return request(app)
        .get("/api/articles")
        .query({ limit, page })
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(5);
          expect(body.total_count).toBeGreaterThan(5);
        });
    });

    test("GET: 200 - returns an array of articles on the 2nd page", () => {
      const page = 2;
      return request(app)
        .get("/api/articles")
        .query({ page })
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBeLessThanOrEqual(10);
          expect(body.total_count).toBeGreaterThan(10);
        });
    });

    test("GET: 200 - returns limited to 5 sorted articles on the 2nd page ", () => {
      const limit = 5;
      const page = 2;
      return request(app)
        .get("/api/articles/?topic=mitch&sort_by=votes&order=desc")
        .query({ limit, page })
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("votes", {
            descending: true,
          });
          body.articles.forEach((article) => {
            expect(article).toHaveProperty("topic", "mitch");
          });
          expect(body.articles.length).toBeLessThanOrEqual(5);
          expect(body.total_count).toBeGreaterThan(limit);
        });
    });

    test("GET: 200 - returns all filtered articles when default limit is higher than total_count", () => {
      return request(app)
        .get("/api/articles/?topic=cats")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article) => {
            expect(article).toHaveProperty("topic", "cats");
          });
          expect(body.articles.length).toBeLessThanOrEqual(10);
          expect(body.total_count).toBe(3);
        });
    });

    test("GET: 200 - returns all filtered articles when total_count is less than limit but limit is less than 50", () => {
      const limit = 20;
      return request(app)
        .get("/api/articles/?topic=mitch")
        .query({ limit })
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article) => {
            expect(article).toHaveProperty("topic", "mitch");
          });
          expect(body.articles.length).toBeLessThanOrEqual(limit);
          expect(body.total_count).toBe(11);
        });
    });

    test("GET: 400 - returns error message when a limit query is not a number", () => {
      const limit = "abc";
      return request(app)
        .get("/api/articles")
        .query({ limit })
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("abc value is invalid");
        });
    });

    test("GET: 400 - returns error message when a limit query is a negative integer", () => {
      const limit = -3;
      return request(app)
        .get("/api/articles")
        .query({ limit })
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("-3 value is invalid");
        });
    });

    test("GET: 400 - returns error message when a page query is a negative integer", () => {
      const page = -2;
      return request(app)
        .get("/api/articles")
        .query({ page })
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("-2 value is invalid");
        });
    });

    test("GET: 400 - returns error message when a page query is a non-integer value", () => {
      const page = 2.5;
      return request(app)
        .get("/api/articles/")
        .query({ page })
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("2.5 value is invalid");
        });
    });

    test("GET: 404 - returns error message for non-existing page", () => {
      const page = 909;
      return request(app)
        .get("/api/articles")
        .query({ page })
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Not Found");
        });
    });

    test("GET: 404 - returns error message when the limit exceeds a total_count and is more than 50", () => {
      const limit = 10000;
      return request(app)
        .get("/api/articles")
        .query({ limit })
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Limit exceeds the total number of articles");
        });
    });

    test("GET: 404 - returns error message when the limit is more than 50 and a total_count is less than limit", () => {
      const limit = 51;
      return request(app)
        .get("/api/articles?title=cats")
        .query({ limit })
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("Limit exceeds the total number of articles");
        });
    });
  });

  describe("POST: /api/login", () => {
    test("POST: 201 - returns a user object with following properties", () => {
      const loginnedUser = {
        email: "icellusedkars@examp-le.com",
        password: "Password3212",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 201 - returns a user object if the 'email' has uppercase characters", () => {
      const loginnedUser = {
        email: "IcelLusedKars@examp-le.com",
        password: "Password3212",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            })
          );
        });
    });

    test("POST: 401 - returns an error if the password is incorrect", () => {
      const loginnedUser = {
        email: "icellusedkars@examp-le.com",
        password: "Password423323",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(401)
        .then(({ body: { message } }) => {
          expect(message).toBe("Password is incorrect");
        });
    });

    test("POST: 404 - returns an error if the email is not found", () => {
      const loginnedUser = {
        email: "icellusedka3232rs@examp-le.com",
        password: "Password423323",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(404)
        .then(({ body: { message } }) => {
          expect(message).toBe("User Not Found");
        });
    });

    test("POST: 400 - returns an error if the user body object misses 'email' and 'password'", () => {
      const loginnedUser = {};
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - returns an error if the user body object doesn't have 'password'", () => {
      const loginnedUser = {
        email: "icellusedkars@examp-le.com",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - returns an error if the user body object doesn't have 'email'", () => {
      const loginnedUser = {
        password: "Password12345",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - returns an error if the user body object has empty 'email' and 'password", () => {
      const loginnedUser = {
        email: "",
        password: "",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid user data");
        });
    });

    test("POST: 400 - returns an error if the 'email' is not valid", () => {
      const loginnedUser = {
        email: "example12334@example",
        password: "Password12345",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });

    test("POST: 400 - returns an error if the 'password' is not valid", () => {
      const loginnedUser = {
        email: "icellusedkars@examp-le.com",
        password: "password",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid password");
        });
    });

    test("POST: 400 - returns an error if both 'password' and 'email' are not valid", () => {
      const loginnedUser = {
        email: "icellusedkars@examp-le",
        password: "password",
      };
      return request(app)
        .post("/api/login")
        .send(loginnedUser)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe("Invalid email");
        });
    });
  });

  describe("GET: /api", () => {
    test("GET: 200 - a get request returns a json object with all 9 available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body: { endpointsList } }) => {
          expect(endpointsList).toBeInstanceOf(Object);
          expect(Object.keys(endpointsList).length).toBe(9);
        });
    });
  });
});

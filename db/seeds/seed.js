const format = require("pg-format");
const db = require("../connection");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
} = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics;`);
    })
    .then(() => {
      const topicsTablePromise = db.query(`
      CREATE TABLE topics (
        slug VARCHAR PRIMARY KEY,
        description VARCHAR
      );`);

      const usersTablePromise = db.query(`
      CREATE TABLE users (
        email VARCHAR PRIMARY KEY,
        username VARCHAR NOT NULL,
        avatar_url VARCHAR DEFAULT 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
      );`);

      return Promise.all([topicsTablePromise, usersTablePromise]);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        topic VARCHAR NOT NULL REFERENCES topics(slug),
        email VARCHAR NOT NULL REFERENCES users(email),
        author VARCHAR NOT NULL,
        body VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        votes INT DEFAULT 0 NOT NULL,
        article_img_url VARCHAR DEFAULT 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'
      );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        body VARCHAR NOT NULL,
        article_id INT REFERENCES articles(article_id) NOT NULL,
        email VARCHAR NOT NULL REFERENCES users(email),
        author VARCHAR NOT NULL,
        votes INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
    })
    .then(() => {
      const insertTopicsQueryStr = format(
        "INSERT INTO topics (slug, description) VALUES %L;",
        topicData.map(({ slug, description }) => [slug, description])
      );
      const topicsPromise = db.query(insertTopicsQueryStr);

      const insertUsersQueryStr = format(
        "INSERT INTO users ( email, username, avatar_url) VALUES %L;",
        userData.map(({ email, username, avatar_url }) => [
          email,
          username,
          avatar_url,
        ])
      );
      const usersPromise = db.query(insertUsersQueryStr);

      return Promise.all([topicsPromise, usersPromise]);
    })
    .then(() => {
      const formattedArticleData = articleData.map(convertTimestampToDate);
      const insertArticlesQueryStr = format(
        "INSERT INTO articles (title, topic, email, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;",
        formattedArticleData.map(
          ({
            title,
            topic,
            email,
            author,
            body,
            created_at,
            votes = 0,
            article_img_url,
          }) => [
            title,
            topic,
            email,
            author,
            body,
            created_at,
            votes,
            article_img_url,
          ]
        )
      );

      return db.query(insertArticlesQueryStr);
    })
    .then(({ rows: articleRows }) => {
      const articleIdLookup = createRef(articleRows, "title", "article_id");
      const formattedCommentData = formatComments(commentData, articleIdLookup);

      const insertCommentsQueryStr = format(
        "INSERT INTO comments (body, email, author, article_id, votes, created_at) VALUES %L;",
        formattedCommentData.map(
          ({ body, email, author, article_id, votes = 0, created_at }) => [
            body,
            email,
            author,
            article_id,
            votes,
            created_at,
          ]
        )
      );
      return db.query(insertCommentsQueryStr);
    });
};

module.exports = seed;

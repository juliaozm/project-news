const db = require("../db/connection.js");
const fs = require("fs/promises");
const bcrypt = require("bcrypt");
const {
  isPositiveInteger,
  isEmailValid,
  isUsernameValid,
  isPasswordValid,
  comparePasswords,
} = require("./validations.js");

const fetchTopics = () => {
  const sqlString = `
        SELECT * FROM topics;
    `;
  return db.query(sqlString).then(({ rows }) => {
    return rows;
  });
};

const fetchTotalArticlesNumber = (topic) => {
  const queryValues = [];
  let sqlString = `
    SELECT COUNT(*) FROM articles
  `;

  if (topic !== undefined) {
    sqlString += `
      WHERE topic = $1
    `;
    queryValues.push(topic);
  }
  return db.query(sqlString, queryValues).then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "Not Found" });
    } else {
      return +rows[0].count;
    }
  });
};

const fetchArticles = async (
  topic,
  sort_by = "created_at",
  order = "DESC",
  page = 1,
  limit = 10
) => {
  const queryValues = [];

  await isPositiveInteger(limit, page);

  const total_count = await fetchTotalArticlesNumber(topic);

  if (total_count && limit > 50) {
    return Promise.reject({
      status: 404,
      message: "Limit exceeds the total number of articles",
    });
  }

  let sqlString = `
    SELECT articles.*, COUNT(comments.comment_id) as comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
  `;

  if (topic !== undefined) {
    sqlString += `
    WHERE topic = $1
    `;
    queryValues.push(topic);
  }

  sqlString += `
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}
    LIMIT ${limit} 
    OFFSET ${(page - 1) * limit};
  `;

  const { rowCount, rows } = await db.query(sqlString, queryValues);
  if (rowCount === 0) {
    return Promise.reject({ status: 404, message: "Not Found" });
  } else {
    const articles = rows;
    return { articles, total_count };
  }
};

const fetchArticleById = (article_id) => {
  const sqlString = `
        SELECT articles.*, COUNT(comments.comment_id) as comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;
    `;
  return db.query(sqlString, [article_id]).then(({ rows: [article] }) => {
    if (!article) {
      return Promise.reject({ status: 404, message: "Not Found" });
    } else {
      return article;
    }
  });
};

const fetchCommentsByArticleId = (article_id) => {
  // check that this article exists in the articles database
  const articleString = `
        SELECT * FROM articles
        WHERE article_id = $1;
    `;
  return db
    .query(articleString, [article_id])
    .then(({ rowCount, rows }) => {
      if (rowCount === 0) {
        // article doesn't exist
        return Promise.reject({
          status: 404,
          message: "This article does not exist",
        });
      } else {
        // article exists
        return rows[0];
      }
    })
    .then((article) => {
      // fetch comments
      const commentSQL = `
            SELECT * FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC;
        `;
      return db
        .query(commentSQL, [article.article_id])
        .then(({ rowCount, rows }) => {
          if (rowCount === 0) {
            // no comments
            return [
              {
                message: "No comments associated with this article",
                comments: [],
              },
            ];
          } else {
            // comments exist
            return rows;
          }
        });
    });
};

const addNewComment = (article_id, newCommentData) => {
  if (
    Object.keys(newCommentData).length < 2 ||
    !newCommentData.username ||
    !newCommentData.body ||
    isNaN(article_id) ||
    article_id <= 0 ||
    !Number.isInteger(Number(article_id))
  ) {
    return Promise.reject({ status: 400, message: "Invalid data sent" });
  }

  const { username, body, votes = 0 } = newCommentData;

  // checking if the username exists in the users database
  const userString = `
        SELECT * FROM users
        WHERE username = $1;
    `;
  return db
    .query(userString, [username])
    .then(({ rowCount, rows }) => {
      if (rowCount === 0) {
        // user doesn't exist
        return Promise.reject({
          status: 404,
          message: "This user does not exist",
        });
      } else {
        // user exists
        return rows[0];
      }
    })
    .then((user) => {
      // adding a comment to the comments database
      const created_at = new Date();
      const commentString = `
            INSERT INTO comments
                (article_id, author, body, votes, created_at)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
      return db
        .query(commentString, [
          article_id,
          user.username,
          body,
          votes,
          created_at,
        ])
        .then(({ rows: [comment] }) => {
          comment.created_at = Date.parse(comment.created_at);
          return comment;
        });
    });
};

const changeVotesOnArticle = (inc_votes, article_id) => {
  if (!inc_votes || typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, message: "Bad Request" });
  }
  const sqlString = `
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;
    `;
  return db
    .query(sqlString, [inc_votes, article_id])
    .then(({ rowCount, rows }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: "This article does not exist",
        });
      } else {
        let [article] = rows;
        article.created_at = Date.parse(article.created_at);
        return article;
      }
    });
};

const fetchUsers = () => {
  const sqlString = `
        SELECT * FROM users;
    `;
  return db.query(sqlString).then(({ rows }) => {
    const users = rows.map(({ email, username, avatar_url }) => ({
      email,
      username,
      avatar_url,
    }));
    return users;
  });
};

const addNewUser = async (newUser) => {
  if (
    Object.keys(newUser).length < 3 ||
    !newUser.email ||
    !newUser.username ||
    !newUser.password
  ) {
    return Promise.reject({ status: 400, message: "Invalid user data" });
  }

  const email = newUser.email.trim().toLowerCase();
  const username = newUser.username.trim();
  const password = newUser.password.trim();

  await isEmailValid(email);
  await isUsernameValid(username);
  await isPasswordValid(password);
  const hashedPassword = await bcrypt.hash(password, 10);

  const emailStr = `
    SELECT * FROM users
    WHERE email = $1;
  `;

  const usernameStr = `
    SELECT * FROM users
    WHERE username = $1;
  `;

  const [emailResp, usernameResp] = await Promise.all([
    db.query(emailStr, [email]),
    db.query(usernameStr, [username]),
  ]);

  if (emailResp.rowCount === 1 && usernameResp.rowCount === 1) {
    return Promise.reject({
      status: 409,
      message: "This user already exists",
    });
  } else if (emailResp.rowCount === 1) {
    return Promise.reject({
      status: 409,
      message: "This email already exists",
    });
  } else if (usernameResp.rowCount === 1) {
    return Promise.reject({
      status: 409,
      message: "This username already exists",
    });
  } else if (emailResp.rowCount === 0 && usernameResp.rowCount === 0) {
    const newUserString = `
        INSERT INTO users
            (email, username, password)
        VALUES
            ($1, $2, $3)
        RETURNING *;
      `;
    return db
      .query(newUserString, [email, username, hashedPassword])
      .then(({ rows }) => {
        const user = {
          email: rows[0].email,
          username: rows[0].username,
          avatar_url: rows[0].avatar_url,
        };
        return user;
      });
  }
};

const fetchUserByEmail = async (email) => {
  if (!email || email == null) {
    return Promise.reject({ status: 400, message: "Invalid user data" });
  }
  const trimmedEmail = email.trim().toLowerCase();
  await isEmailValid(trimmedEmail);
  const sqlString = `
    SELECT * FROM users
    WHERE email = $1;
  `;
  const { rows, rowCount } = await db.query(sqlString, [trimmedEmail]);
  if (rowCount === 0) {
    return Promise.reject({ status: 404, message: "User Not Found" });
  } else {
    return rows[0];
  }
};

const checkAndComparePassword = async (user, password) => {
  if (!password || password == null) {
    return Promise.reject({ status: 400, message: "Invalid user data" });
  }
  const trimmedPassword = password.trim();
  await isPasswordValid(trimmedPassword);
  const response = await bcrypt.compare(trimmedPassword, user.password);
  if (!response) {
    return Promise.reject({ status: 401, message: "Password is incorrect" });
  }
  return response;
};

const deleteComment = (comment_id) => {
  const sqlString = `
        DELETE FROM comments
        WHERE comment_id = $1;
    `;
  return db.query(sqlString, [comment_id]).then(({ rowCount }) => {
    if (rowCount === 0)
      return Promise.reject({ status: 404, message: "Not Found" });
  });
};

const fetchEndpoints = async () => {
  const file = `./endpoints.json`;
  const stringifiedData = await fs.readFile(file, "utf-8");
  return JSON.parse(stringifiedData);
};

module.exports = {
  fetchTopics,
  fetchArticles,
  fetchUsers,
  fetchUserByEmail,
  fetchArticleById,
  fetchCommentsByArticleId,
  addNewComment,
  addNewUser,
  changeVotesOnArticle,
  deleteComment,
  fetchEndpoints,
  fetchTotalArticlesNumber,
  checkAndComparePassword,
};

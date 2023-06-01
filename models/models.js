const db = require("../db/connection.js");
const fs = require("fs/promises");
const { isPositiveInteger } = require("./validations.js");

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
    Object.keys(newCommentData).length <= 1 ||
    !newCommentData.username ||
    !newCommentData.body
  ) {
    return Promise.reject({ status: 400, message: "Bad Request" });
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
  return db.query(sqlString).then(({ rows }) => rows);
};

const fetchUserByUsername = (username) => {
  const pattern = /^(?![_0-9])([a-z0-9_]{6,20})$/;
  if (!pattern.test(username)) {
    return Promise.reject({ status: 400, message: "Bad Request" });
  }
  const sqlString = `
    SELECT * FROM users
    WHERE username = $1;
  `;
  return db.query(sqlString, [username]).then(({ rows, rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "Username Not Found" });
    } else {
      return rows[0];
    }
  });
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

const fetchEndpoints = () => {
  const file = `./endpoints.json`;
  return fs.readFile(file, "utf-8").then((stringifiedData) => {
    return JSON.parse(stringifiedData);
  });
};

module.exports = {
  fetchTopics,
  fetchArticles,
  fetchUsers,
  fetchUserByUsername,
  fetchArticleById,
  fetchCommentsByArticleId,
  addNewComment,
  changeVotesOnArticle,
  deleteComment,
  fetchEndpoints,
  fetchTotalArticlesNumber,
};

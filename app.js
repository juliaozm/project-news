const express = require("express");
const cors = require("cors");
const app = express();
const {
  getTopics,
  getArticles,
  getUsers,
  checkUserByEmail,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  postNewUser,
  updateArticle,
  deleteCommentById,
  getAllEndpoints,
  postLoginUser,
  getRefreshToken,
  deleteRefreshToken,
} = require("./controllers/controllers.js");
const cookieParser = require("cookie-parser");
const authToken = require("./middleware/auth.js");
const originDomain = process.env.ORIGIN_DOMAIN;

app.use(cors({ credentials: true, origin: originDomain }));
app.use(express.json());
app.use(cookieParser());

app.get("/api", getAllEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post(
  "/api/articles/:article_id/comments",
  authToken,
  postCommentByArticleId
);
app.patch("/api/articles/:article_id", authToken, updateArticle);
app.delete("/api/comments/:comment_id", authToken, deleteCommentById);
app.get("/api/users", authToken, getUsers);
app.get("/api/users/:email", checkUserByEmail);
app.post("/api/users", postNewUser);
app.post("/api/login", postLoginUser);
app.get("/api/refresh_token", getRefreshToken);
app.delete("/api/refresh_token", authToken, deleteRefreshToken);

app.use((err, request, response, next) => {
  if (err.status && err.message) {
    response.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "22P02" || err.code === "42601") {
    response.status(400).send({ message: "Bad Request" });
  } else if (err.code === "42703") {
    response.status(404).send({ message: "Not Found" });
    next(err);
  }
});

app.use((err, request, response, next) => {
  response.status(500).send({ message: "Ooops something went wrong!" });
});

module.exports = app;

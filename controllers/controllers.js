const jwtTokens = require("../models/jwt-helpers.js");
const jwt = require("jsonwebtoken");
const {
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
} = require("../models/models.js");

const getTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((err) => next(err));
};

const getArticles = (request, response, next) => {
  const { topic, sort_by, order, page, limit } = request.query;
  fetchArticles(topic, sort_by, order, page, limit)
    .then(({ articles, total_count }) => {
      response.status(200).send({ articles, total_count });
    })
    .catch((err) => {
      next(err);
    });
};

const getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => next(err));
};

const getCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

const postCommentByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const newCommentData = request.body;

  addNewComment(article_id, newCommentData)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((err) => next(err));
};

const updateArticle = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;
  changeVotesOnArticle(inc_votes, article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => next(err));
};

const getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => next(err));
};

const postNewUser = (request, response, next) => {
  const newUser = request.body;
  addNewUser(newUser)
    .then((user) => {
      response.status(201).send({ user });
    })
    .catch((err) => next(err));
};

const getUserByEmail = (request, response, next) => {
  const { email } = request.params;
  fetchUserByEmail(email)
    .then((user) => {
      response.status(200).send({
        user: {
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url,
        },
      });
    })
    .catch((err) => next(err));
};

const deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  deleteComment(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch((err) => next(err));
};

const getAllEndpoints = (request, response, next) => {
  fetchEndpoints()
    .then((endpointsList) => {
      response.status(200).send({ endpointsList });
    })
    .catch((err) => next(err));
};

const postLoginUser = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const user = await fetchUserByEmail(email);
    await checkAndComparePassword(user, password);
    //JWT
    let tokens = jwtTokens(user);
    response
      .cookie("refresh_token", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "none",
      })
      .status(201)
      .send(tokens);
  } catch (error) {
    next(error);
  }
};

const getRefreshToken = (request, response, next) => {
  try {
    const refreshToken = request.cookies.refresh_token;
    if (refreshToken == null) {
      return response.status(401).send({ error: "Null refresh token" });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) return response.status(403).json({ error: error.message });
        let tokens = jwtTokens(user);
        response
          .cookie("refresh_token", tokens.refreshToken, {
            httpOnly: true,
            sameSite: "none",
          })
          .status(202)
          .send(tokens);
      }
    );
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
};

const deleteRefreshToken = (request, response, next) => {
  try {
    response.clearCookie("refresh_token");
    return response.status(200).send({ message: "Refresh token deleted" });
  } catch (error) {
    response.status(401).send({ error: error.message });
  }
};

module.exports = {
  getTopics,
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  updateArticle,
  postNewUser,
  getUsers,
  getUserByEmail,
  deleteCommentById,
  getAllEndpoints,
  postLoginUser,
  getRefreshToken,
  deleteRefreshToken,
};


const {
    fetchTopics,
    fetchArticles,
    fetchArticleById,
    fetchCommentsByArticleId,
    addNewComment,
    changeVotesOnArticle,
 } = require('../models/models.js')

const getTopics = (request, response, next) => {
    fetchTopics()
    .then((topics) => {
        response.status(200).send({topics});
    })
    .catch(err => next(err))
}

const getArticles = (request, response, next) => {
    fetchArticles()
    .then(articles => {
        response.status(200).send({articles})
    })
    .catch(err => next(err))
}

const getArticleById = (request, response, next) => {
    const {article_id} = request.params;
    fetchArticleById(article_id)
    .then(article => {
        response.status(200).send({article})
    })
    .catch(err => next(err))
}

const getCommentsByArticleId = (request, response, next) => {
    const {article_id} = request.params;
    fetchCommentsByArticleId(article_id)
    .then((comments) => {
        response.status(200).send({comments})
    })
    .catch(err => next(err))
}

const postCommentByArticleId = (request, response, next) => {
    const {article_id} = request.params;
    const newCommentData = request.body;

    addNewComment(article_id, newCommentData)
    .then((comment) => {
        response.status(201).send({comment})
    })
    .catch(err => next(err))
}

const updateArticle = (request, response, next) => {
    const {article_id} = request.params;
    const {inc_votes} = request.body;
    changeVotesOnArticle(inc_votes, article_id)
    .then(article => {
        response.status(200).send({article })
    })
    .catch(err => next(err))
}

module.exports = {
    getTopics,
    getArticles,
    getArticleById,
    getCommentsByArticleId,
    postCommentByArticleId,
    updateArticle,
}
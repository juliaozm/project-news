
const {
    fetchTopics,
    fetchArticles,
    fetchUsers,
    fetchArticleById,
    fetchCommentsByArticleId,
    addNewComment,
    changeVotesOnArticle,
    deleteComment,
    fetchEndpoints
 } = require('../models/models.js')

const getTopics = (request, response, next) => {
    fetchTopics()
    .then((topics) => {
        response.status(200).send({topics});
    })
    .catch(err => next(err))
}

const getArticles = (request, response, next) => {
    const {topic, sort_by, order} = request.query
    fetchArticles(topic, sort_by, order)
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

const getUsers = (request, response, next) => {
    fetchUsers()
    .then(users => {
        response.status(200).send({users})
    })
    .catch(err => next(err))
}

const deleteCommentById = (request, response, next) => {
    const {comment_id} = request.params;
    deleteComment(comment_id)
    .then(() => {
        response.status(204).send()
    })
    .catch(err => next(err))
}

const getAllEndpoints = (request, response, next) => {
    fetchEndpoints()
    .then((endpointsList) => {
        response.status(200).send({endpointsList})
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
    getUsers,
    deleteCommentById,
    getAllEndpoints
}
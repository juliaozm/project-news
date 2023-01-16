
const {
    fetchTopics,
    fetchArticles,
    fetchArticleById,
 } = require('../models/models.js')

const getTopics = (request, response, next) => {
    fetchTopics()
    .then((topics) => {
        response.status(200).send({topics});
    })
    .catch(err => next(err))
}

const getArticles = (request, response, next) => {
    const {sort_by} = request.query;
    fetchArticles(sort_by)
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

module.exports = {
    getTopics,
    getArticles,
    getArticleById
}
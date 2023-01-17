
const {
    fetchTopics,
    fetchArticles,
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

module.exports = {
    getTopics,
    getArticles
}
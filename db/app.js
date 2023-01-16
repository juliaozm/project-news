const express = require('express')
const app = express()
const {
    getTopics
} = require('../db/controllers/controllers.js')

app.get('/api/topics', getTopics)

app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).send({message: 'Ooops something went wrong!'})
})

module.exports = app
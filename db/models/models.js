const db = require('../connection.js')

const fetchTopics = () => {
    const sqlString = 
    `
        SELECT * FROM topics;
    `
    return db.query(sqlString).then(({rows}) => {
        return rows
    })
}

const fetchArticles = (sort_by='article_id') => {
    const sqlString = 
    `
        SELECT articles.*, COUNT(comments.comment_id) as comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY ${sort_by} DESC;
    `
    return db.query(sqlString)
    .then(({rows}) => rows)
}

module.exports = {
    fetchTopics,
    fetchArticles,
}
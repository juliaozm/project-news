# The NC-News API

## Introduction

The NC-News API is a RESTful HTTP API designed to provide information about users, topics, articles, and comments to a front-end architecture. It was implemented as a back-end project during my studies at Northcoders coding bootcamp.

The front-end project is here `https://github.com/juliaozm/nc-news`

## Key Features

The NC-News API offers the following key features:

- Filtering and sorting articles based on various criteria
- Limiting the number of articles per page and providing pagination support
- Creating, deleting, and upvoting/downvoting comments on articles
- User registration and authentication
- JSON Web Token (JWT) protection for sensitive endpoints

## Technologies Used

The NC-News API was built using the following technologies and tools:

- Node.js and Express.js for building API
- PostgreSQL database for storing and managing data
- Pg-format for formatting queries in PostgreSQL
- Jest and Supertest for building API endpoints functionality using TDD approach
- Bcrypt for password hashing and authentication
- JSON Web Tokens for user authentication and authorization
- Dotenv for configuring sensitive information as database credentials, API keys

## Getting Started

To get started with the NC-News API, follow these steps:

1. Clone the repository and navigate to the project directory:
   `git clone https://github.com/juliaozm/project-news.git`
   `cd project-news`

2. Install the required dependencies:
   `npm install`

3. Configure the connection in the .env file: Create `.env.test` and `.env.development` in the root folder. In .env files add `PGDATABASE=nc_news_test` and `PGDATABASE=nc_news` respectively

4. Set up the PostgreSQL databases:
   `npm run setup-dbs`

5. Seed databases with the initial data:
   `npm run seed`

6. Start the server:
   `npm start`

7. Run tests:
   `cd __tests__`
   `npm test`

## Authentication

**JSON Web Tokens (JWT)** is used for authentication and autherization.

An **access token** is obtained upon successful authentication (e.g., `POST api/login` or `POST api/users`) and is used to authenticate protected API calls. The access token has an expiration time of `30 seconds`.

To include the access token in the API requests protected with JWT, you need to send it in the **Authorization HTTP header** as follows:
`Authorization: Bearer {accessToken}`

A **refresh token** is used to obtain a new access token, by making an API call to the refresh token endpoint (e.g., `GET /api/refresh_token`). It has a longer expiration time of `15min`. If the refresh token is valid, the server will respond with a new access token. If the refresh token is invalid or expired, you will receive a `401 - Unauthorized` HTTP error and the user must be prompted to log in again.

To ask the server to invalidate all tokens associated with a particular user, you can delete refresh token (e.g.`DELETE api/refresh_token`)

#### POST `api/login`

The body must have:

- `email`: Valid email address must match existed user's email
- `password`: Valid password associated with the user

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/login`

```
{
    "email": "andre_and8@gmail.com",
    "password" : "Calculation12412!"
}
```

It returns the following:

```
status: 201 Created

{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJlbWFpbCI6ImFuZHJlX2FuZDhAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhbmRyZV85MzIzIiwiYXZhdGFyX3VybCI6Imh0dHBzOi8vd3d3LmdyYXZhdGFyLmNvbS9hdmF0YXIvMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA_ZD1tcCZmPXkiLCJpYXQiOjE2ODg1MTYzNzYsImV4cCI6MTY4ODUxNjQwNn0.\_Qc0Xg2qCrpU2Exom5eVHpoN9W9ME_OKIzJM9RFgl8M"
}
```

The `accessToken` contains the `username`, `email` and `avatar_url` of the user

<br />

### `GET api/refresh_token`

Protected with JWT: `true`

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/refresh_token`

It returns the following:

```
status: 200 OK

{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCeyJlbWFpbCI6ImFuZHJlX2FuZDhAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhbmRyZV85MzIzIiwiYXZhdGFyX3VybCI6Imh0dHBzOi8vd3d3LmdyYXZhdGFyLmNvbS9hdmF0YXIvMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA_ZD1tcCZmPXkiLCJpYXQiOjE2ODg1MTYzNzYsImV4cCI6MTY4ODUxNjQwNn0.\_Qc0Xg2qCrpU2Exom5eVHpoN9W9ME_OKIzJM9RFgl8M"
}

```

<br />

### `DELETE api/refresh_token`

Protected with JWT: `true`

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/refresh_token`

It returns the following:

```
status: 204 No Content

```

## Available Endpoints

All the available API endpoints are deployed at `https://julia-ozmitel-backend-project.onrender.com/api`

### 1. Topics

#### 1.1 `GET /api/topics`

To retrive all the topics from the database. Protected with JWT: `false`

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/topics`

<details>
<summary>Show response: An array of all the topics </summary>

```
status: 200 OK

{
	"topics": [
		{
			"slug": "coding",
			"description": "Code is love, code is life"
		},
		{
			"slug": "football",
			"description": "FOOTIE!"
		},
		{
			"slug": "cooking",
			"description": "Hey good looking, what you got cooking?"
		}
	]
}
```

</details>

<br/>

### 2. Articles

#### 2.1. `GET /api/articles`

To retrive all the articles from the database. Protected with JWT: `false`

| Queries   | Options                          | Example |
| --------- | -------------------------------- | ------- |
| `topic`   | coding, cooking, football        | coding  |
| `sort_by` | created_at, comment_count, votes | votes   |
| `order`   | asc, desc                        | desc    |
| `page`    | From 1 to available integer      | 1       |
| `limit`   | 6, 10, 24                        | 6       |

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/articles?topic=coding&sort_by=votes&order=desc&limit=6&page=1`

<details>
<summary>Show response: An array of the articles depends on the queries </summary>

```
status: 200 OK

{
	"articles": [
		{
			"article_id": 12,
			"title": "The battle for Node.js security has only begun",
			"topic": "coding",
			"author": "tickle122",
			"body": "The founder of the Node Security Project says Node.js still has common vulnerabilities, but progress has been made to make it more secure. Appearing at the recent Node Community Convention in San Francisco, project founder Adam Baldwin, chief security officer at Web consulting company &yet, emphasized risks, protections, and progress. Baldwin sees four risks within the Node ecosystem pertinent to the enterprise: the code dependency tree, bugs, malicious actors, and people. I think of [the dependency tree] more as the dependency iceberg, to be honest, Baldwin said, where your code is the ship and your dependencies that you have with your packaged JSON is that little tiny iceberg at the top. But developers need to be aware of the massive iceberg underneath, he stressed.",
			"created_at": "2020-11-15T13:25:00.000Z",
			"votes": 3,
			"article_img_url": "https://images.pexels.com/photos/10845119/pexels-photo-10845119.jpeg?w=700&h=700",
			"comment_count": "7"
		},
		{
			"article_id": 7,
			"title": "Using React Native: One Year Later",
			"topic": "coding",
			"author": "tickle122",
			"body": "When I interviewed for the iOS developer opening at Discord last spring, the tech lead Stanislav told me: React Native is the future. We will use it to build our iOS app from scratch as soon as it becomes public. As a native iOS developer, I strongly doubted using web technologies to build mobile apps because of my previous experiences with tools like PhoneGap. But after learning and using React Native for a while, I am glad we made that decision.",
			"created_at": "2020-10-18T01:26:00.000Z",
			"votes": 1,
			"article_img_url": "https://images.pexels.com/photos/6424586/pexels-photo-6424586.jpeg?w=700&h=700",
			"comment_count": "8"
		},
		{
			"article_id": 8,
			"title": "Express.js: A Server-Side JavaScript Framework",
			"topic": "coding",
			"author": "cooljmessy",
			"body": "You’re probably aware that JavaScript is the programming language most often used to add interactivity to the front end of a website, but its capabilities go far beyond that—entire sites can be built on JavaScript, extending it from the front to the back end, seamlessly. Express.js and Node.js gave JavaScript newfound back-end functionality—allowing developers to build software with JavaScript on the server side for the first time. Together, they make it possible to build an entire site with JavaScript: You can develop server-side applications with Node.js and then publish those Node.js apps as websites with Express. Because Node.js itself wasn’t intended to build websites, the Express framework is able to layer in built-in structure and functions needed to actually build a site. It’s a pretty lightweight framework that’s great for giving developers extra, built-in web application features and the Express API without overriding the already robust, feature-packed Node.js platform. In short, Express and Node are changing the way developers build websites.",
			"created_at": "2020-10-05T23:23:00.000Z",
			"votes": 0,
			"article_img_url": "https://images.pexels.com/photos/11035482/pexels-photo-11035482.jpeg?w=700&h=700",
			"comment_count": "7"
		},
		{
			"article_id": 11,
			"title": "Designing Better JavaScript APIs",
			"topic": "coding",
			"author": "tickle122",
			"body": "At some point or another, you will find yourself writing JavaScript code that exceeds the couple of lines from a jQuery plugin. Your code will do a whole lot of things; it will (ideally) be used by many people who will approach your code differently. They have different needs, knowledge and expectations.",
			"created_at": "2020-07-07T00:13:00.000Z",
			"votes": 0,
			"article_img_url": "https://images.pexels.com/photos/5483071/pexels-photo-5483071.jpeg?w=700&h=700",
			"comment_count": "5"
		},
		{
			"article_id": 9,
			"title": "Learn HTML5, CSS3, and Responsive WebSite Design in One Go",
			"topic": "coding",
			"author": "grumpy19",
			"body": "Both CSS3 and HTML5 are just about fully supported in all modern browsers, and we there are techniques in place to patch old browsers that lack support. So there is no disadvantage to using CSS3 and HTML5 today. The opposite is true, however: there are many painful, frustrating disadvantages with forgoing HTML5 and CSS3. You may already “know” a bit of HTML5 and a touch of CSS3 (or perhaps you probably know enough old-school HTML and CSS, and with this knowledge, you might have thought you needn’t learn HTML5 and CSS3 fully.",
			"created_at": "2020-05-26T15:06:00.000Z",
			"votes": 0,
			"article_img_url": "https://images.pexels.com/photos/1591061/pexels-photo-1591061.jpeg?w=700&h=700",
			"comment_count": "8"
		},
		{
			"article_id": 1,
			"title": "Running a Node App",
			"topic": "coding",
			"author": "jessjelly",
			"body": "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
			"created_at": "2020-11-07T06:03:00.000Z",
			"votes": 0,
			"article_img_url": "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?w=700&h=700",
			"comment_count": "8"
		}
	],
	"total_count": 12
}
```

</details>

<br/>

#### 2.2. `GET /api/articles/:article_id`

To retrive a particular article from the database. Protected with JWT: `false`

| Params     | Options                            | Example |
| ---------- | ---------------------------------- | ------- |
| article_id | Integer must match existed article | 3       |

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/articles/3`

<details>
<summary>Show response: An article object</summary>

```
status: 200 OK

{
	"article": {
		"article_id": 3,
		"title": "22 Amazing open source React projects",
		"topic": "coding",
		"author": "happyamy2016",
		"body": "This is a collection of open source apps built with React.JS library. In this observation, we compared nearly 800 projects to pick the top 22. (React Native: 11, React: 11). To evaluate the quality, Mybridge AI considered a variety of factors to determine how useful the projects are for programmers. To give you an idea on the quality, the average number of Github stars from the 22 projects was 1,681.",
		"created_at": "2020-02-29T11:12:00.000Z",
		"votes": 0,
		"article_img_url": "https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?w=700&h=700",
		"comment_count": "10"
	}
}
```

</details>

<br/>

#### 2.3. PATCH /api/articles/:article_id

To upvote or downvote for a particular article in the database. Protected with JWT: `true`

| Params     | Options                            | Example |
| ---------- | ---------------------------------- | ------- |
| article_id | Integer must match existed article | 3       |

The body must have:

- `inc_votes`: Positive or negative integer

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/articles/3`

```
{
    "inc_votes": 100
}
```

<details>
<summary>Show response: The updated article object</summary>

```
status: 200 OK

{
    "article": {
        "article_id": 3,
        "title": "22 Amazing open source React projects",
        "topic": "coding",
        "author": "happyamy2016",
        "body": "This is a collection of open source apps built with React.JS library. In this observation, we compared nearly 800 projects to pick the top 22. (React Native: 11, React: 11). To evaluate the quality, Mybridge AI considered a variety of factors to determine how useful the projects are for programmers. To give you an idea on the quality, the average number of Github stars from the 22 projects was 1,681.",
        "created_at": "2020-02-29T11:12:00.000Z",
        "votes": 100,
        "article_img_url": "https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?w=700&h=700",
        "comment_count": "10"
    }
}

```

</details>

<br/>

## 3. Comments

#### 3.1. `GET /api/articles/:article_id/comments`

To retrieve all the comments associated with a particular article. Protected with JWT: `false`

| Params     | Options                            | Example |
| ---------- | ---------------------------------- | ------- |
| article_id | Integer must match existed article | 3       |

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/articles/3/comments`

<details>
<summary>Show response: An array of comments</summary>

```
status: 200 OK

{
	"comments": [
		{
			"comment_id": 145,
			"body": "Odit aut error. Occaecati et qui. Quam nam aut dolorem.",
			"article_id": 3,
			"author": "jessjelly",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/4/4f/MR_JELLY_4A.jpg/revision/latest?cb=20180104121141",
			"votes": 10,
			"created_at": "2020-10-03T14:18:00.000Z"
		},
		{
			"comment_id": 3,
			"body": "Qui sunt sit voluptas repellendus sed. Voluptatem et repellat fugiat. Rerum doloribus eveniet quidem vero aut sint officiis. Dolor facere et et architecto vero qui et perferendis dolorem. Magni quis ratione adipisci error assumenda ut. Id rerum eos facere sit nihil ipsam officia aspernatur odio.",
			"article_id": 3,
			"author": "grumpy19",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
			"votes": 3,
			"created_at": "2020-09-23T00:18:00.000Z"
		},
		{
			"comment_id": 231,
			"body": "Consequatur inventore voluptatum hic qui magnam nulla rerum. Beatae sint sed qui iure in est. Quo quibusdam molestias autem animi repellendus at et. Voluptates maxime recusandae. Repudiandae qui nesciunt.",
			"article_id": 3,
			"author": "happyamy2016",
			"avatar_url": "https://vignette1.wikia.nocookie.net/mrmen/images/7/7f/Mr_Happy.jpg/revision/latest?cb=20140102171729",
			"votes": 11,
			"created_at": "2020-08-07T07:05:00.000Z"
		},
		{
			"comment_id": 112,
			"body": "Voluptatem ipsam doloremque voluptate debitis voluptas nam non delectus rem. Et dicta assumenda dignissimos sed ea. Odit perspiciatis dicta consequatur aut facere in. Accusamus qui laudantium tenetur reprehenderit sed et velit iusto. Illo nihil voluptas rerum.",
			"article_id": 3,
			"author": "grumpy19",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
			"votes": 11,
			"created_at": "2020-08-06T12:04:00.000Z"
		},
		{
			"comment_id": 142,
			"body": "Dolor et eos. Earum suscipit est quia aut et qui voluptate. Et dolore necessitatibus asperiores qui perferendis. Adipisci rerum quod commodi ut omnis qui. Officiis maxime cum maxime expedita officia quisquam.",
			"article_id": 3,
			"author": "tickle122",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/d/d6/Mr-Tickle-9a.png/revision/latest?cb=20180127221953",
			"votes": 2,
			"created_at": "2020-07-03T07:06:00.000Z"
		},
		{
			"comment_id": 200,
			"body": "Fugiat aut ipsam ea commodi natus commodi officiis amet. Rerum quae error. Vel eum voluptates corrupti aperiam.",
			"article_id": 3,
			"author": "jessjelly",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/4/4f/MR_JELLY_4A.jpg/revision/latest?cb=20180104121141",
			"votes": -1,
			"created_at": "2020-05-20T07:15:00.000Z"
		},
		{
			"comment_id": 28,
			"body": "Dolorem excepturi quaerat. Earum dolor sapiente aut.",
			"article_id": 3,
			"author": "grumpy19",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
			"votes": 2,
			"created_at": "2020-03-04T13:05:00.000Z"
		},
		{
			"comment_id": 192,
			"body": "Blanditiis aut a. Ipsum iusto quam quos veritatis repellendus nostrum. Sequi quis culpa.",
			"article_id": 3,
			"author": "jessjelly",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/4/4f/MR_JELLY_4A.jpg/revision/latest?cb=20180104121141",
			"votes": 3,
			"created_at": "2020-02-21T12:08:00.000Z"
		},
		{
			"comment_id": 167,
			"body": "Deleniti itaque et est unde autem. Labore illo commodi quaerat natus fugiat adipisci. Adipisci unde recusandae aliquam suscipit ipsum.",
			"article_id": 3,
			"author": "grumpy19",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
			"votes": 19,
			"created_at": "2020-02-05T09:16:00.000Z"
		},
		{
			"comment_id": 51,
			"body": "Eius dolor ipsa eaque qui sed accusantium est tenetur omnis. Eligendi necessitatibus sunt voluptate occaecati et quis consequuntur aut. Maxime nihil ut quia culpa.",
			"article_id": 3,
			"author": "grumpy19",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
			"votes": -3,
			"created_at": "2020-01-14T03:12:00.000Z"
		}
	]
}
```

</details>

<br />

#### 3.2. `POST /api/articles/:article_id/comments`

To post a comment for a particular article. Protected with JWT: `true`

| Params     | Options                            | Example |
| ---------- | ---------------------------------- | ------- |
| article_id | Integer must match existed article | 3       |

The body must have:

- `username`: Must match existed user's username
- `body`: Any string

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/articles/3/comments`

```
{
    "username": "cooljmessy",
    "body": "Great!"
}
```

<details>
<summary>Show response: A comment object</summary>

```
status 201 Created

{
    "comment_id": 200,
    "body": "Great!",
    "article_id": 3,
    "author": "cooljmessy",
    "avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/1/1a/MR_MESSY_4A.jpg/revision/latest/scale-to-width-down/250?cb=20170730171002",
    "votes": 16,
    "created_at": "2020-11-15T09:14:00.000Z"
}
```

</details>

<br />

#### 3.3. `PATCH /api/comments/:comment_id`

To upvote or downvote for a particular comment. Protected with JWT: `true`

| Params     | Options                            | Example |
| ---------- | ---------------------------------- | ------- |
| comment_id | Integer must match existed comment | 125     |

The body must have:

- `inc_votes`: Positive or negative integer

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/comments/125`

```
{
    "inc_votes": -100
}

```

<details>
<summary>Show response: A comment object</summary>

```
status 201 Created

{
    "comment_id": 125,
    "body": "Great!",
    "article_id": 3,
    "author": "cooljmessy",
    "avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/1/1a/MR_MESSY_4A.jpg/revision/latest/scale-to-width-down/250?cb=20170730171002",
    "votes": -116,
    "created_at": "2020-11-15T09:14:00.000Z"
}
```

</details>

<br />

#### 3.4 `DELETE /api/comments/:comment_id`

To delete a particular comment. Protected with JWT: `true`

| Params     | Options                            | Example |
| ---------- | ---------------------------------- | ------- |
| comment_id | Integer must match existed comment | 125     |

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/comments/125`

It returns the following:

```
status: 204 No Content

```

<br />

## 4. Users

#### 4.1 `GET /api/users`

To retrieve all the users from the database. Protected with JWT: `true`

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/users`

<details>
<summary>Show response: An array of all users</summary>

```
status 201 Created

{
	"users": [
		{
			"email": "tickle122@gmail.com",
			"username": "tickle122",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/d/d6/Mr-Tickle-9a.png/revision/latest?cb=20180127221953"
		},
		{
			"email": "grumpy19@gmail.com",
			"username": "grumpy19",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013"
		},
		{
			"email": "happyamy2016@gmail.com",
			"username": "happyamy2016",
			"avatar_url": "https://vignette1.wikia.nocookie.net/mrmen/images/7/7f/Mr_Happy.jpg/revision/latest?cb=20140102171729"
		},
		{
			"email": "cooljmessy@gmail.com",
			"username": "cooljmessy",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/1/1a/MR_MESSY_4A.jpg/revision/latest/scale-to-width-down/250?cb=20170730171002"
		},
		{
			"email": "weegembump@gmail.com",
			"username": "weegembump",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/7e/MrMen-Bump.png/revision/latest?cb=20180123225553"
		},
		{
			"email": "jessjelly@gmail.com",
			"username": "jessjelly",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/4/4f/MR_JELLY_4A.jpg/revision/latest?cb=20180104121141"
		}
    ]
}

```

</details>

<br />

#### 4.2. `GET /api/users/:email`

To check if the user exists with a particular email in the database. Protected with JWT: `false`

| Params | Options             |
| ------ | ------------------- |
| email  | Valid email address |

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/users/cooljmessy@gmail.com`

It returns the following:

```
status: 200 OK

{
    "status": true,
    "message": "cooljmessy@gmail.com exists"
}

```

<br />

#### 4.3. `POST /api/users`

To add a new user to the database. Protected with JWT: `false`

The body must contain:

- `email`: Unique valid email address,
- `username`: Unique string contains lowercase characters, number and underscore,
- `password`: Valid password

##### Example request: `https://julia-ozmitel-backend-project.onrender.com/api/users`

```
{
    "username": "andre_9323",
    "email": "andre_and8@gmail.com",
    "password" : "Calculation12412!"`
}

```

It returns the following:

```
status: 201 Created

{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJlbWFpbCI6ImFuZHJlX2FuZDhAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhbmRyZV85MzIzIiwiYXZhdGFyX3VybCI6Imh0dHBzOi8vd3d3LmdyYXZhdGFyLmNvbS9hdmF0YXIvMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA_ZD1tcCZmPXkiLCJpYXQiOjE2ODg1MTYwMzUsImV4cCI6MTY4ODUxNjA2NX0.Ja14wMnUc6MLfrQKwlshzu1GYOilggjt42RSPbOhHDI"
}

```

The `accessToken` contains the `username`, `email` and `avatar_url` of the user

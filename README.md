# The News API

This is a mimic of the real HTTP REST API for retrieving news which servers the information about topics, articles, comments, and users to the front end architecture.

You can access the list of all the available API endpoints and what each endpoint is supposed to serve by this link https://julia-ozmitel-backend-project.onrender.com/api

### The instruction on how to deploy the API on your local machine:

1. To clone down this GitHub repository:
```
git clone https://github.com/juliaozm/project-news.git
```

2. To access the necessary environment variables, you need to create two .env files

There are two databases in this project: one for real development data and another for test data. As .env.* is added to the .gitignore, 
create ```.env.test``` and ```.env.development``` to be able to connect to both databases locally. 

Into each, add ```PGDATABASE=<database_name_here>```, with the correct database name for that environment. See ```/db/setup.sql``` for the database names. 

3. To install dependencies: 
```
npm install
```

4. To setup the databases: 
```
npm run setup-dbs
```

5. Next seed the created databases: 
```
npm run seed
```

6. Now you can run all the deployed tests:
```
npm test
```

The minimum versions of `Node.js` and `Postgres` should be 18.13.0 and 12.12  respectively to run the project

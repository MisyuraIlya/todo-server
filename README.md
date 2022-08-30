## Api to Todo React app

RESTful API based on Expressjs.

## Features
* Sign up/sign in (JWT, bcrypt, Mysql-cookie) - DB_TYPE: mongodb/mysql
  ** mongodb - JWT, bcrypt authentication
  ** 
* Reset password 
* Two data bases mysql and mongodb (can switch in .env file)
* CRUD (Create, Read, Update, Delete) - todo service
* Mail service (nodemailer)
* verify email
* Redis - stored data JWT - refresh token.
* Docker - redis installed in docker container


## Call the API
As best practice, use these headers to make requests to the API:
``
Content-Type:application/x-www-form-urlencoded
Accept:application/json
``
When signed in, you must provide the access token:
``
Authorization: <Access_token>
``


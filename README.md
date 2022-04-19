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

## env file
```
JWT_ACCESS_SECRET = secret
JWT_REFRESH_SECRET = secret2
JWT_ACCESS_TIME = 30s
JWT_REFRESH_TIME = 30d
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
DB_CONN_STRING = mongodb+srv://root:730126890@cluster0.wbu0w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
DB_TYPE=mongodb
SMTP_HOST="smtp.gmail.com"
SMTP__PORT=587
SMTP_USER=spetsar97ilya@gmail.com
SMTP_PASSWORD=kpxoemypopltbmje
API_URL=http://dev.local:3001
CLIENT_URL=http://dev.local:3000
```

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


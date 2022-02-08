// GLOBAL
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose'
// LOCAL
import routerAuth from './router/auth-router.js';
import routerTodo from './router/todo-router.js';
import errorMiddleware from './middlewares/error-middleware.js';
import db from './config.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3001;

app.use(session({
  key: 'userId',
  secret: 'hello wolrd',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routerAuth);
app.use('/api', routerTodo)
app.use(errorMiddleware)

async function startDB() {
  try {
    await mongoose.connect(process.env.DB_CONN_STRING, () => console.log('Connected to mongodb'))
  } catch (error) {
    console.log(error);
  }
}

async function startMongo() {
  try {
    await app.listen(PORT, () => { console.log(`SERVER STARTED ON PORT ${PORT}`); });
  } catch (error) {
    console.log(error);
  }
}

async function startMysql() {
  try {
    await db.connect((err) => { if (err) throw err; console.log('DB Connected!'); });
    app.listen(PORT, () => { console.log(`SERVER STARTED ON PORT ${PORT}`); });
  } catch (error) {
    console.log(error);
  }
}


function DbFactory() {
  switch (process.env.DB_TYPE ) {
      case 'mysql':
          return startMysql();
      case 'mongodb':
          return (startMongo(),startDB());
      default:
          throw new Error(`[TodoFactory] Unknown type ${process.env.DB_TYPE}`);
      
  }
}

DbFactory()
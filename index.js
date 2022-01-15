// GLOBAL
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose'
// LOCAL
import router from './router.js';
// import db from './config.js';
import Todo from './schema.js'

const app = express();
const PORT = 3001;
const DB_URL = 'mongodb+srv://spetsar:730126890Ss@cluster0.wbu0w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

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
app.use('/api', router);

async function startApp() {
  try {
    await mongoose.connect(DB_URL)
    app.listen(PORT, () => { console.log(`SERVER STARTED ON PORT ${PORT}`); });
  } catch (error) {
    console.log(error);
  }
}

startApp();

// GLOBAL
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
// LOCAL
import router from './router.js';
import db from './config.js';

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
app.use('/api', router);

async function startApp() {
  try {
    await db.connect((err) => { if (err) throw err; console.log('DB Connected!'); });
    app.listen(PORT, () => { console.log(`SERVER STARTED ON PORT ${PORT}`); });
  } catch (error) {
    console.log(error);
  }
}

startApp();

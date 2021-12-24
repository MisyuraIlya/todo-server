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
const PORT = 3006;

app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
}));
app.use(flash());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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

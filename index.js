import express from 'express'
import cors from 'cors'
import mysql from 'mysql'

import router from './router.js';

const app = express()
const PORT = 3004;

/*
reponse example 
{ // HTTP 200 OK 
    status: 'OK',
    data: [],
    error: null,
}

{ // HTTP 400 Validation error
    status: 'VALIDATION_FAIL',
    data: null,
    error: 'Invalid user name.'
}

{ // HTTP 500 Mysql connection is down
    status: 'SYSTEM_ERROR',
    data: null,
    error: 'MySQL not found or some'aß
}
*/

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '730126890Ss!',
    database: 'tododb',
});

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api', router)

async function startApp(){
    try { 
        await db.connect((err) => {if (err) throw err;console.log('DB Connected!');});
        app.listen(PORT, () => { console.log('SERVER STARTED ON PORT ' + PORT)}) 
    } catch (error) {
        console.log(error)
    }
}



startApp()
// import { DATE_TIME_FORMAT } from './enums'
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'
import express from 'express'
import cors from 'cors'
import mysql from 'mysql'

// const cors = require('cors')
const app = express()
// const mysql = require('mysql');
const PORT = 3001;

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
    error: 'MySQL not found or some'
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


//================================== todo ========================================
app.post('/todo', (request , response) => {
    //VALIDATION 
    const id = uuidv4()
    const title = request.body.title
    const created = moment().format('HH:mm, DD.MM.YYYY')
    const ended = null
    const description = request.body.description
    const status = "ACTIVE"

    const sqlInsert = "INSERT INTO todo_list (id, title, created, ended, description, status) VALUES (?, ?, ?, ?, ?, ?)"
    db.query(sqlInsert, [id, title, created, ended, description, status], (err, result) => {
        response.send('ok') // response
    })
});

app.delete('/todo/:id', (request, response) => {
    const id = request.params.id
    const sqlDelete = "DELETE FROM todo_list WHERE id = ?";
    db.query(sqlDelete, id, (err, result) => {
        response.send('ok')
        if (err) console.log(err)
    })
})

app.put("/todo/update/:id", (request,response) => {
    const id = request.params.id
    const query =  `UPDATE todo_list SET status = 'DONE' , ended = '${moment().format('HH:mm, DD.MM.YYYY')}'  WHERE id = ? ; `;
    db.query(query, id , (err, result) => {
        response.send('ok');
        if (err) console.log(err)
    })
})


app.get('/todo', (request, response) => {
    const  page = request.params.page ?? 1; //ofset
    const  limit = request.params.limit ?? 10;
    const query = "SELECT * FROM todo_list WHERE status = 'ACTIVE' LIMIT ? "
    db.query(query, [ limit],  (err, result) => {
        response.send(result)
    })
})

app.get('/todo/history', (request, response) => {
    const  page = request.params.page ?? 1; //ofset
    const  limit = request.params.limit ?? 10;
    const query = "SELECT * FROM todo_list WHERE status = 'DONE';"
    db.query(query, [ limit],  (err, result) => {
        response.send(result)
    })
})


//====================================================================================================================================

//===================================================== subtodo =====================================================================
app.post('/subtodo', (request , response) => {
    //VALIDATION 
    const id = uuidv4()
    const parentid = request.body.id
    console.log(parentid)
    const created = moment().format('HH:mm, DD.MM.YYYY')
    const ended = null
    const subdescription = request.body.subdescription
    console.log(subdescription)
    const status = "ACTIVE"
    const sqlInsert = "INSERT INTO todo_sub (id, parentid, created, ended, subdescription, status) VALUES (?, ?, ?, ?, ?, ?)"
    db.query(sqlInsert, [id, parentid, created, ended, subdescription, status], (err, result) => {
        response.send('ok') // response
    })
});

app.delete('/subtodo/:id', (request, response) => {
    const id = request.params.id
    const sqlDelete = "DELETE FROM todo_sub WHERE id = ?";
    db.query(sqlDelete, id, (err, result) => {
        response.send('ok')
        if (err) console.log(err)
    })
})

app.put("/subtodo/update/:id", (request,response) => {
    const id = request.params.id
    console.log(id)
    const query =  `UPDATE todo_sub SET status = 'ACTIVE' , ended = '${moment().format('HH:mm, DD.MM.YYYY')}'  WHERE id = ? ; `;
    db.query(query, id , (err, result) => {
        response.send('ok');
        if (err) console.log(err)
    })
})


app.get('/subtodo/:id', (request, response) => {
    const id = request.params.id
    
    const query = "SELECT * FROM todo_sub WHERE parentid  = ?"
    db.query(query, id,  (err, result) => {
        response.send(result)
    })
})

app.get('/subhistory', (request, response) => {
    const  page = request.params.page ?? 1; //ofset
    const  limit = request.params.limit ?? 10;
    const query = "SELECT * FROM todo_sub ;"
    db.query(query, [ limit],  (err, result) => {
        response.send(result)
    })
})

//=======================================================================================================

async function startApp(){
    try { 
        await db.connect((err) => {if (err) throw err;console.log('DB Connected!');});
        app.listen(PORT, () => { console.log('SERVER STARTED ON PORT ' + PORT)}) 
    } catch (error) {
        console.log(error)
    }
}



startApp()
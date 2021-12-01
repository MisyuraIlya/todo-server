import Router, { request, response } from 'express'
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'
import mysql from 'mysql'
const router = new Router()

const LIMIT = 4
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '730126890Ss!',
    database: 'tododb',
});


function query(sql,params) {
    return new Promise((resolve, reject) => {
        db.query(sql,params, (err, result, fields) => {
            if(err) {
                return reject(err)
            } else {
            resolve(result)
            }
        })
    })
}

router.post('/todos', async (request , response) => {
    const id = uuidv4()
    const title =  request.body.title
    if(!request.body.title) {
        response.status(400).json('title didnt writen')
    }
    if(!request.body.description) {
        response.status(400).json('description didnt writen')
    }
    const ended = null
    const description =  request.body.description
    const status = "ACTIVE"
    const sql = "INSERT INTO todo_list (id, title, created, ended, description, status) VALUES (?, ?, now(), ?, ?, ?)"
    const result = await query(sql,[id,title,ended,description,status])
    response.send('ok')
}) 

router.post('/todos/:id/subtodos/:subid', async (request , response) => {
    if(!request.body.id) {
        response.status(400).json('description didnt writen')
    }
    if(!request.body.subdescription) {
        response.status(400).json('description didnt writen')
    }
        const id = uuidv4()
        const parentid = request.body.id
        const ended = null
        const subdescription = request.body.subdescription

    const status = "ACTIVE"
    const sql = "INSERT INTO todo_sub (id, parentid, created, ended, subdescription, status) VALUES (?, ?, now(), ?, ?, ?)"
    const result = await query(sql,[id, parentid, ended, subdescription, status])
    response.send('ok')
    
}) 

router.get('/todos',  async (request, response) => {
    const status = request.query.status
    let sql = `SELECT COUNT(id) AS count FROM todo_list WHERE status = "${status}"`
    const result = await query(sql,status)
    const total = result[0].count
    const numberOfPages = Math.ceil(total / LIMIT);
    let page = request.query.page ? Number(request.query.page) : 1;
    console.log(page)
    if (page > numberOfPages) {
        response.redirect('/api/todoss?page='+encodeURIComponent(numberOfPages));
    }else if(page < 1){
        response.redirect('/api/todoss?page='+encodeURIComponent('1'));
    }
    const startingLimit = (page -1) * LIMIT;
    const limit = LIMIT
    sql = `SELECT * FROM todo_list WHERE status = "${status}" LIMIT ${startingLimit},${LIMIT} `
    const resultAll = await query(sql)
    response.send({data:resultAll, page, limit, total})

})

router.get('/subhistory', async (request, response) => {
        const sql = "SELECT * FROM todo_sub ;"
        const result = await query(sql)
        response.send(result)
    })

router.get('/subtodos/:id', async (request, response) => {
    if(!request.params.id){ 
        response.status(400).json('description didnt writen')
    }
        const id =  request.params.id
        const sql = "SELECT * FROM todo_sub WHERE parentid  = ?"
        const result = await query(sql,id)
        response.send(result)
}) 

router.put('/todos/:id',  async (request,response) => {
        const id =  request.params.id
        const sql =  `UPDATE todo_list SET status = 'DONE' , ended = now()  WHERE id = ? ; `;
        const result = await query(sql,id)
        response.send('ok')
}) 

router.put('/subtodos/update/:id/:status', async (request,response) => {
    if(!request.params.id){ 
        response.status(400).json('description didnt writen')
    }
    if(!request.params.status){ 
        response.status(400).json('description didnt writen')
    }
        const id =  request.params.id
        const status =  request.params.status
        if(status === 'DONE'){
            const queryFirst = `UPDATE todo_sub SET status = '${status}' , ended = now()  WHERE id = ? ; `;
            db.query(queryFirst,id , (err, result) => {
                 response.send('ok')
            })
        } else {
            const queryFirst = `UPDATE todo_sub SET status = '${status}' , ended = null  WHERE id = ? ; `;
            db.query(queryFirst,id , (err, result) => {
                 response.send('ok')
            })
        }
})

router.delete('/todos/:id', async (request, response) => {
    if(!request.params.id){ 
        response.status(400).json('description didnt writen')
    }
        const id =  request.params.id
        const sql = "DELETE FROM todo_list WHERE id = ?";
        const result = await query(sql,id)
        response.send('ok')
}) 

router.delete('/subtodos/:id',async (request, response) => {
    if(!request.params.id){ 
        response.status(400).json('description didnt writen')
    }
        const id =  request.params.id
        const sql = "DELETE FROM todo_sub WHERE id = ?";
        const result = await query(sql,id)
        response.send('ok')
}) 


export default router;
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


function query(sql) {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result, fields) => {
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
    if(!title) {
        response.status(400).json('title didnt writen')
    }
    // const created = moment().format('HH:mm, DD.MM.YYYY')
    const ended = null
    const description =  request.body.description
    if(!description) {
        response.status(400).json('description didnt writen')
    }
    const status = "ACTIVE"

    const sqlInsert = "INSERT INTO todo_list (id, title, created, ended, description, status) VALUES (?, ?, now(), ?, ?, ?)"
    db.query(sqlInsert, [id, title, ended, description, status], (err, result) => {
        response.send('ok') 
    })

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
        // const created = moment().format('HH:mm, DD.MM.YYYY')
        const ended = null
        const subdescription = request.body.subdescription

    const status = "ACTIVE"
    const sqlInsert = "INSERT INTO todo_sub (id, parentid, created, ended, subdescription, status) VALUES (?, ?, now(), ?, ?, ?)"
    db.query(sqlInsert, [id, parentid, ended, subdescription, status], (err, result) => {
        response.send('ok') 
    })
    
}) 



router.get('/todos', async (request, response) => {
   
        let sql = 'SELECT COUNT(id) AS count FROM todo_list WHERE status = "ACTIVE"'; 
        const resultQuery = await query(sql)
        db.query(sql, (err, result) => {
            if(err) throw err;
            const total = resultQuery
            const numberOfPages = Math.ceil(total / LIMIT);
            let page = request.query.page ? Number(request.query.page) : 1;
            if (page > numberOfPages) {
                response.redirect('/api?page='+encodeURIComponent(numberOfPages));
            }else if(page < 1){
                response.redirect('/api?page='+encodeURIComponent('1'));
            }
            const startingLimit = (page -1) * LIMIT;
            const limit = LIMIT
            sql = `SELECT * FROM todo_list WHERE status = 'ACTIVE' LIMIT ${startingLimit},${LIMIT} `
            db.query(sql, (err, result) => {
                if(err) throw err;
                let iterator = (page - 5) < 1 ? 1 : page - -5;
                let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 9) : page+ (numberOfPages - page);
                if(endingLink < (page +4) ){
                    iterator -= (page + 4 ) - numberOfPages;
                }
            response.send({data: result, page , limit,  total, iterator, endingLink, numberOfPages })
            })
        })

})

router.get('/todoss',  async (request, response) => {
    let sql = 'SELECT * FROM todo_list WHERE status = "ACTIVE"'
    const result = await query(sql)
    response.json(result)
    console.send(result)
})
router.get('/todos/history', async (request, response) => {
    try{
        let sql = 'SELECT * FROM todo_list WHERE status = "DONE" ;';
        db.query(sql, (err, result) => {
            if(err) throw err;
            const total = result.length;
            const numberOfPages = Math.ceil(total / LIMIT);
            let page = request.query.page ? Number(request.query.page) : 1;
            if (page > numberOfPages) {
                response.redirect('/api?page='+encodeURIComponent(numberOfPages));
            }else if(page < 1){
                response.redirect('/api?page='+encodeURIComponent('1'));
            }
            const startingLimit = (page -1) * LIMIT;
            const limit = LIMIT
            sql = `SELECT * FROM todo_list WHERE status = 'DONE' LIMIT ${startingLimit},${LIMIT} `
            db.query(sql, (err, result) => {
                if(err) throw err;
                let iterator = (page - 5) < 1 ? 1 : page - -5;
                let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 9) : page+ (numberOfPages - page);
                if(endingLink < (page +4) ){
                    iterator -= (page + 4 ) - numberOfPages;
                }
            response.send(result)
            })
        })
    } catch (err) {
        response.status(500).json(err)
    }
})
router.get('/subhistory', async (request, response) => {
    try {
        const query = "SELECT * FROM todo_sub ;"
        db.query(query,  (err, result) => {
            response.send(result)
        })
    } catch (e) {
        response.status(500).json(e)
    }
    })

router.get('/subtodos/:id', async (request, response) => {
    try{
        const id =  request.params.id
        const query = "SELECT * FROM todo_sub WHERE parentid  = ?"
        db.query(query, id,  (err, result) => {
            response.send(result)
        })
    } catch (e) {
        response.status(500).json(e)
    }
}) 


router.put('/todos/:id',  async (request,response) => {
    try {
        const id =  request.params.id
        const query =  `UPDATE todo_list SET status = 'DONE' , ended = '${moment().format('HH:mm, DD.MM.YYYY')}'  WHERE id = ? ; `;
        db.query(query, id , (err, result) => {
            response.send('ok');
            if (err) console.log(err)
        })
    } catch (e) {
        response.status(500).json(e)
    }
}) 

router.put('/subtodos/update/:id/:status', async (request,response) => {

    try { 
        const id =  request.params.id
        const status =  request.params.status
        console.log(id, status)
        if(status === 'DONE'){
            const queryFirst = `UPDATE todo_sub SET status = '${status}' , ended = now()  WHERE id = ? ; `;
            db.query(queryFirst,id , (err, result) => {
                console.log(result)
                 response.send('ok')
            })
        } else {
            const queryFirst = `UPDATE todo_sub SET status = '${status}' , ended = null  WHERE id = ? ; `;
            db.query(queryFirst,id , (err, result) => {
                console.log(result)
                 response.send('ok')
            })
        }
    } catch (e) {
        response.status(500).json(e)
    }
})

router.delete('/todos/:id', async (request, response) => {
    try{
        const id =  request.params.id
        const sqlDelete = "DELETE FROM todo_list WHERE id = ?";
        db.query(sqlDelete, id, (err, result) => {
            response.send('ok')
            if (err) console.log(err)
        })
    } catch (e) {
        response.status(500).json(e)
    }
}) 

router.delete('/subtodos/:id',async (request, response) => {
    try{
        const id =  request.params.id
        const sqlDelete = "DELETE FROM todo_sub WHERE id = ?";
        db.query(sqlDelete, id, (err, result) => {
            response.send('ok')
            if (err) console.log(err)
        })
    } catch (e) {
        response.status(500).json(e)
    }
}) 


export default router;
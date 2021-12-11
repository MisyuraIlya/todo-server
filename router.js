import Router, { request, response } from 'express';
import { v4  as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import { body, validationResult } from 'express-validator';

import mysql from 'mysql';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import jwt from "jsonwebtoken"
const router = new Router();

const LIMIT = 4;
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '730126890Ss!',
  database: 'tododb',
});

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

function sendResponse(response, data=null, status='OK', error=null) {
  return response.status(ERROR[statusCode].code).json({status: ERROR[statusCode].status, data, error})
}

function validateTodos (request, response, next) {
  const {title, description} = request.body;
  if (!title || !description) {
    return response
      .status(400)
      .json({
        status: 'VALIDATION_ERROR',
        data: null,
        error: 'title didnt writen'
      });
  }
  return next();
}

//validated
router.post('/todos', [validateTodos], async (request, response) => {
  const id = uuidv4();
  const { title, description } = request.body;
  console.log(title, description)
  const ended = null;
  const status = 'ACTIVE';
  const sql = 'INSERT INTO todo_list (id, title, created, ended, description, status) VALUES (?, ?, now(), ?, ?, ?)';
  const result = await query(sql, [id, title, ended, description, status]);
  sendResponse(response, result);
});


function validateTodos2 (request, response, next) {
  const parentid = request.params.id;
  const subDescription = request.body.subDescription;
  if (!parentid || !subDescription) {
    return response
    .status(400)
    .json({
      status: 'VALIDATION_ERROR',
      data: null,
      error: 'title didnt writen'
    });
  }
  return next();
}
//validated
router.post('/todos/:id/subtodos/', [validateTodos2],  async (request, response) => {
  const id = uuidv4();
  const parentid = request.params.id;
  const ended = null;
  const  subdescription  = request.body.subDescription;
  const status = 'ACTIVE';
  const sql = 'INSERT INTO todo_sub (id, parentid, created, ended, subdescription, status) VALUES (?, ?, now(), ?, ?, ?)';
  const result = await query(sql, [id, parentid, ended, subdescription, status]);
  response.send({status:200, data:[result], error:null});
});

function validateTodos3( request, response, next){
  const status = request.query.status
  const page = request.query.page
  if((status === 'ACTIVE' || status === 'DONE') && !isNaN(page)){
    return next();
    } else {
      return response
      .status(400)
      .json({
        status: 'VALIDATION_ERROR',
        data: null,
        error: 'Status is not validated'
    });
  }
}
//VALIDATED
router.get('/todos',[validateTodos3], async (request, response) => {
  const  status  = request.query.status;
  let sql = `SELECT COUNT(id) AS count FROM todo_list WHERE status = ?`;
  const result = await query(sql, status);
  const total = result[0].count;
  const numberOfPages = Math.ceil(total / LIMIT);
  const page = request.query.page ? Number(request.query.page) : 1;
  if (page > numberOfPages) {
    return response
    .status(400)
    .json({
      status: 'VALIDATION_ERROR',
      data: null,
      error: 'Number of pages higher '
  });
  }
  if (page > numberOfPages) {
    response.redirect(`/api/todoss?page=${encodeURIComponent(numberOfPages)}`);
  } else if (page < 1) {
    response.redirect(`/api/todoss?page=${encodeURIComponent('1')}`);
  }
  const startingLimit = (page - 1) * LIMIT;
  const limit = LIMIT;
  sql = `SELECT * FROM todo_list WHERE status = ? LIMIT ${startingLimit},${LIMIT} `;
  const resultAll = await query(sql,status);
  response.send({status:200, data: resultAll, page:page, limit:limit, total:total, error:null});
});

//not needed to validate
router.get('/subhistory', async (request, response) => {
  const sql = 'SELECT * FROM todo_sub ;';
  const result = await query(sql);
  response.send({status:200, dataSubHistory:result, error:null});
});


//validated
router.get('/subtodos/:id',  async (request, response) => {
  const  id  = request.params.id;
  console.log(id)
  if(uuidValidate(id)) {
    const sql = 'SELECT * FROM todo_sub WHERE parentid  = ?';
    const result = await query(sql, id);
    console.log('a',result)
    response.send({status:200, data:result, error:null});
  } else {
    response.json({status:400, data:null, error:'UUID is invalid'})
  }
});

//validated
router.put('/todos/:id', async (request, response) => {
  const  id  = request.params.id;
  if(uuidValidate(id)) {
    const sql = 'UPDATE todo_list SET status = \'DONE\' , ended = now()  WHERE id = ? ; ';
    const result = await query(sql, id);
    response.send({status:200, data:result, error:null});
  } else {
    response.json({status:400, data:null, error:'Not found in db this todo'})
  }
});

function validateTodos5 (request, response, next) {
  const id = request.params.id;
  const status = request.params.status;
  if (status == 'ACTIVE' || status == 'DONE') {
      return next();
    } else {
      return response
      .status(400)
      .json({
        status: 'VALIDATION_ERROR',
        data: null,
        error: 'status in not ACTIVE OR DONE'
    });
  }
}
//VALIDATED
router.put('/subtodos/update/:id/:status',[validateTodos5], async (request, response) => {
  const  id = request.params.id;
  const  status  = request.params.status;
  if (status === 'DONE') {
    const sql = `UPDATE todo_sub SET status = ? , ended = now()  WHERE id = ? ; `;
    const result = await query(sql, [status,id]);
    response.json(result)
  } else {
    const sql = `UPDATE todo_sub SET status = ? , ended = null  WHERE id = ? ; `;
    const result = await query(sql, [status,id]);
    response.json({status:200, data:result, error:null})
  }
});

//VALIDATED
router.delete('/todos/:id', async (request, response) => {
  const id  = request.params.id
  if(uuidValidate(id)) {
    const sql = 'DELETE FROM todo_list WHERE id = ?';
    const result = await query(sql, id);
    response.json({status:200, data:result, error:'error 2'});
  } else {
    response.json({status:400, data:null, error:"There is no id in db to delete"})
  }

});

//VALIDATED
router.delete('/subtodos/:id', async (request, response) => {
  const id = request.params.id;
  if(uuidValidate(id)) {
  const sql = 'DELETE FROM todo_sub WHERE id = ?';
  const result = await query(sql, id);
  response.send({status:200, data:result, error:null})
  } else {
  response.json({status:400, data:null, error:"There is no id in db to delete"})
  };
});


// router.get('/user/confirm/:uuid', (request, response) => {

// })
// router.post('/auth/signup', async (request, response) => {

//   const sql = `SELECT id, email, name FROM users WHERE email = "${request.body.email}"`;
//   db.query(sql, (err, result, fields) => {
//     if (err) {
//       response.status(400, err, response)
//     } else if (typeof result !== 'undefined' && result.length > 0) {
//       const results = JSON.parse(JSON.stringify(result))
//       results.map(rs => {
//         response.status(302).json(`member with this - ${rs.email} already registered`)
//         return true
//       })
//     } else {
//       const name = request.body.name
//       const lastname = request.body.lastname
//       const email = request.body.email
//       const salt = genSaltSync(15)
//       const password = hashSync(request.body.password, salt)
//       const sql = `INSERT INTO users (name, lastname, email, password) VALUES("${name}","${lastname}","${email}","${password}")`;
//       db.query(sql, (err,result) => {
//         if(err) {
//           response.status(400).JSON(err)
//         } else {
//           response.status(200).json('Registration succses')
//         }
//       })
//     }
//   });
// })

// router.get('/auth/signin', async (request, response) => {
//    console.log(request.query.email)
//   const sql = `SELECT id, email, password FROM users WHERE email = "${request.query.email}"`
//   db.query(sql, (err, result, fields) => {
//     if(err) {
//       response.status(400).json(err)
//     } else if(result.length <= 0) {
//       response.status(401).json(`Member with this ${request.query.email} not found`)
//     } else {
//       const results = JSON.parse(JSON.stringify(result))
//       results.map(rs => {
//         const password = compareSync(request.query.password, rs.password)
//         if (password) {
//           const token = jwt.sign({
//             userId: rs.id,
//             email: rs.email
//           }, 'asd', { expiresIn: 120 * 120 })

//           response.status(200).json({token: token})
//         } else {
//           response.status(401).json('Error')
//         }
//       })
//     }
//   })
// })

export default router;

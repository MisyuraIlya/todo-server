//GLOBAL
import Router, { request, response } from 'express';
import { v4  as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import { body, validationResult } from 'express-validator';
import mysql from 'mysql';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
//
import randtoken from 'rand-token';
import nodemailer from 'nodemailer';
import session from 'express-session';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import cookieParser from 'cookie-parser';
//LOCAL
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

const userValidationRules = () => {
  return [
    // username must be an email
    body('email').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 }),
  ]
}
const validateSignUp = (request, response, next) => {
  const errors = validationResult(request)
  const name = request.body.name
  const lastname = request.body.lastname
  const phone = request.body.phone

  if (errors.isEmpty() && isNaN(name) && isNaN(lastname) && !isNaN(phone)) {
    console.log('all')
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
  return response.status(422).json({
    errors: extractedErrors,
  })
}


router.post('/auth/signup', userValidationRules(), validateSignUp, async (request, response) => {
  const email = request.body.email
  console.log(email)
  const sql = `SELECT id, email, name FROM users WHERE email = ?`;
  const result = await query(sql, email)
  if(typeof result !== 'undefined' && result.length > 0) {
    const results = JSON.parse(JSON.stringify(result))
    results.map(rs => {
      response.status(302).json(`member with this - ${rs.email} already registered`)
      return true
    })
  } else {
    const id = uuidv4();
    const name = request.body.name
    const lastname = request.body.lastname
    const email = request.body.email
    const phone = request.body.phone
    const salt = genSaltSync(15)
    const password = hashSync(request.body.password, salt)
    const sql = `INSERT INTO users (id, name, lastname, email, password, phone, created, status) VALUES(?, ?, ?, ?, ?, ?, now(), 'DISABLED') `; 
    const sql2 = `INSERT INTO verefication (id, email, token, verify, created, updated) VALUES(?, ?, NULL, 0, now(), now())`
    const result = await query(sql, [ id, name, lastname, email, password, phone ])
    const result2 = await query(sql2, [id, email])

    console.log('registration succses') // how to validate after promise
  }
})


  //send email
  function sendEmail(emaill, token) {
  

    const mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'spetsar97ilya@gmail.com', // Your email id
            pass: 'kpxoemypopltbmje' // Your password
        }
    });

    const mailOptions = {
        from: 'spetsar97ilya@gmail.com',
        to: 'misyurailya5@gmail.com',
        subject: 'Email verification ',
        html: '<p>You requested for email verification, kindly use this <a href="http://dev.local:3005/api/verify-email?token=' + token + '">link</a> to verify your email address</p>'

    };

    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            return 1
        } else {
            return 0
        }
    });
  }

  /* send verification link */
router.post('/send-email', async function(request, response, next) {
 console.log(request.body.email)
  const email = request.body.email;
  //console.log(sendEmail(email, fullUrl));
  const sql = 'SELECT * FROM verefication WHERE email = ?'
  const result = await  query(sql,email)
  console.log(result[0].verify)
  if (result.length > 0) {
    const token = randtoken.generate(20);
    if(result[0].verify == 0) {
      const sent = sendEmail(email, token);
      if (sent != '0') {
        const data = {
          token: token
        }
        const sql = `UPDATE verefication SET ? WHERE email = '${email}'`
        db.query(sql,data,(error, result) => {
          if(error) throw error
        })
        const type = 'success';
        const msg = 'The verefication link has been sent to your email address';
        console.log(msg)
      } else {
        const type = 'error';
        const msg = 'Something goes to wrong. Please try again';
        console.log(msg)
      }
    }
  } else {
    console.log('2');
    const type = 'error';
    const msg = 'The Email is not registered'
  } 
  // request.flash(type,msg)
  response.redirect('/');
})

/* send verification link */
router.get('/verify-email', function(request, response, next) {
 
  console.log(request.query.token )
  const sql = 'SELECT * FROM verefication WHERE token ="' + request.query.token + '"';

  db.query(sql, (err, result) => {
       if (err) throw err;

       var type
       var msg

       console.log(result[0].verify);

        if(result[0].verify == 0){
           if (result.length > 0) {

               var data = {
                   verify: 1
               }

               db.query('UPDATE verefication SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
                   if(err) throw err
              
               })
               type = 'success';
               msg = 'Your email has been verified';
               console.log(msg)
             
           } else {
               console.log('2');
               type = 'success';
               msg = 'The email has already verified';
               console.log(msg)

           }
        }else{
           type = 'error';
           msg = 'The email has been already verified';
        }

       request.flash(type, msg);
       response.redirect('/');
   });
})


router.get('/auth/signin', async (request, response) => {
  const email = request.query.email
   console.log(request.query.email)
   console.log(request.query.password)
  const sql = `SELECT id, email, password FROM users WHERE email = ?`
  // const result = query(sql,email)
  db.query(sql, email, (err, result, fields) => {
    if(err) {
      response.status(400).json(err)
    } else if(result.length <= 0) {
      response.status(401).json(`Member with this ${request.query.email} not found`)
    } else {
      const results = JSON.parse(JSON.stringify(result))
      results.map(rs => {
        const password = compareSync(request.query.password, rs.password)
        if (password) {
          console.log('session start')
          request.session.loggedin = true;
          request.session.username = email;
          response.redirect('/api/home');
          console.log('created session')
          // response.status(200).json('hello')
        } else {
          response.status(401).json('Error')
        }
      })
    }
  })
})



router.get('/home', function(request, response) {
  console.log(request.session.loggedin)
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

// Logout user
router.get('/logout', function (req, res) {
req.session.destroy();
// req.flash('success', 'Login Again Here');
res.redirect('/login');
});



/* send reset password link in email */
router.post('/reset-password-email', (request, response, next) => {
 
  const email = request.body.email;
  console.log(email)
  //console.log(sendEmail(email, fullUrl));

  db.query('SELECT * FROM users WHERE email = ? ', email, (err, result) => {
      if (err) throw err;
       
      var type = ''
      var msg = ''
 
      console.log(result[0]);
   
      if (result[0].email.length > 0) {

         var token = randtoken.generate(20);

         var sent = sendEmail(email, token);

           if (sent != '0') {

              var data = {
                  token: token
              }

              db.query('UPDATE users SET ? WHERE email = ?', [data, email], (err, result) => {
                  if(err) throw err
       
              })

              type = 'success';
              msg = 'The reset password link has been sent to your email address';

          } else {
              type = 'error';
              msg = 'Something goes to wrong. Please try again';
          }

      } else {
          console.log('2');
          type = 'error';
          msg = 'The Email is not registered with us';

      }
  
      request.flash(type, msg);
      response.redirect('/');
  });
})

/* update password to database */
router.post('/update-password', function(req, res, next) {
 
  const token = req.body.token;
  console.log(token)
 db.query('SELECT * FROM users WHERE token = ?', token,  (err, result) => {
      if (err) throw err;

      var type
      var msg

      if (result.length > 0) {
              
            var saltRounds = 10;

           // var hash = bcrypt.hash(password, saltRounds);
           const salt = genSaltSync(15)
           const password = hashSync(req.body.password, salt)



                 var data = {
                      password: password
                  }

                  db.query('UPDATE users SET ? WHERE email = ?', [data, result[0].email], (err, result) => {
                      if(err) throw err
                 
                  });


          type = 'success';
          msg = 'Your password has been updated successfully';
            
      } else {

          console.log('2');
          type = 'success';
          msg = 'Invalid link; please try again';

          }

      req.flash(type, msg);
      res.redirect('/');
  });
})
export default router;

import Router, { request, response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import {} from 'dotenv/config'

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

router.post('/todos', async (request, response) => {
  const id = uuidv4();
  const { title } = request.body;
  if (!request.body.title) {
    response.status(400).json('title didnt writen');
  }
  if (!request.body.description) {
    response.status(400).json('description didnt writen');
  }
  const ended = null;
  const { description } = request.body;
  const status = 'ACTIVE';
  const sql = 'INSERT INTO todo_list (id, title, created, ended, description, status) VALUES (?, ?, now(), ?, ?, ?)';
  const result = await query(sql, [id, title, ended, description, status]);
  response.send(result);
});

router.post('/todos/:id/subtodos/:subid', async (request, response) => {
  const id = uuidv4();
  const parentid = request.body.id;
  const ended = null;
  const { subdescription } = request.body;
  if (!request.body.id) {
    response.status(400).json('description didnt writen'); // why 400 dostn work?
  }
  if (!request.body) {
    response.status(400).json('description didnt writen');
  }
  const status = 'ACTIVE';
  const sql = 'INSERT INTO todo_sub (id, parentid, created, ended, subdescription, status) VALUES (?, ?, now(), ?, ?, ?)';
  const result = await query(sql, [id, parentid, ended, subdescription, status]);
  response.send(result);
});

router.get('/todos', async (request, response) => {
  const { status } = request.query;
  let sql = `SELECT COUNT(id) AS count FROM todo_list WHERE status = "${status}"`;
  const result = await query(sql, status);
  const total = result[0].count;
  const numberOfPages = Math.ceil(total / LIMIT);
  const page = request.query.page ? Number(request.query.page) : 1;
  if (page > numberOfPages) {
    response.redirect(`/api/todoss?page=${encodeURIComponent(numberOfPages)}`);
  } else if (page < 1) {
    response.redirect(`/api/todoss?page=${encodeURIComponent('1')}`);
  }
  const startingLimit = (page - 1) * LIMIT;
  const limit = LIMIT;
  sql = `SELECT * FROM todo_list WHERE status = "${status}" LIMIT ${startingLimit},${LIMIT} `;
  const resultAll = await query(sql);
  response.send({
    data: resultAll, page, limit, total,
  });
});

router.get('/subhistory', async (request, response) => {
  const sql = 'SELECT * FROM todo_sub ;';
  const result = await query(sql);
  response.send(result);
});

router.get('/subtodos/:id', async (request, response) => {
  if (!request.params.id) {
    response.status(400).json('description didnt writen');
  }
  const { id } = request.params;
  const sql = 'SELECT * FROM todo_sub WHERE parentid  = ?';
  const result = await query(sql, id);
  response.send(result);
});

router.put('/todos/:id', async (request, response) => {
  const { id } = request.params;
  const sql = 'UPDATE todo_list SET status = \'DONE\' , ended = now()  WHERE id = ? ; ';
  const result = await query(sql, id);
  response.send(result);
});

router.put('/subtodos/update/:id/:status', async (request, response) => {
  if (!request.params.id) {
    response.status(400).json('description didnt writen');
  }
  if (!request.params.status) {
    response.status(400).json('description didnt writen');
  }
  const { id } = request.params;
  const { status } = request.params;
  if (status === 'DONE') {
    const sql = `UPDATE todo_sub SET status = '${status}' , ended = now()  WHERE id = ? ; `;
    const result = await query(sql, id);
    response.send(result);
  } else {
    const sql = `UPDATE todo_sub SET status = '${status}' , ended = null  WHERE id = ? ; `;
    const result = await query(sql, id);
    response.send(result);
  }
});

router.delete('/todos/:id', async (request, response) => {
  if (!request.params.id) {
    response.status(400).json('description didnt writen');
  }
  const { id } = request.params;
  const sql = 'DELETE FROM todo_list WHERE id = ?';
  const result = await query(sql, id);
  response.send(result);
});

router.delete('/subtodos/:id', async (request, response) => {
  if (!request.params.id) {
    response.status(400).json('description didnt writen');
  }
  const { id } = request.params;
  const sql = 'DELETE FROM todo_sub WHERE id = ?';
  const result = await query(sql, id);
  response.send(result);
});

router.post('/auth/signup', async (request, response) => {
  const sql = `SELECT id, email, name FROM users WHERE email = "${request.body.email}"`;
  db.query(sql, (err, result, fields) => {
    if (err) {
      response.status(400, err, response);
    } else if (typeof result !== 'undefined' && result.length > 0) {
      const results = JSON.parse(JSON.stringify(result));
      results.map((rs) => {
        response.status(302).json(`member with this - ${rs.email} already registered`);
        return true;
      });
    } else {
      const { name } = request.body;
      const { lastname } = request.body;
      const { email } = request.body;
      const salt = genSaltSync(15);
      const password = hashSync(request.body.password, salt);
      const sql = `INSERT INTO users (name, lastname, email, password) VALUES("${name}","${lastname}","${email}","${password}")`;
      db.query(sql, (err, result) => {
        if (err) {
          response.status(400).JSON(err);
        } else {
          response.status(200).json('Registration succses');
        }
      });
    }
  });
});

router.get('/auth/signin', async (request, response) => {
  console.log(request.query.email);
  const sql = `SELECT id, email, password FROM users WHERE email = "${request.query.email}"`;
  db.query(sql, (err, result, fields) => {
    if (err) {
      response.status(400).json(err);
    } else if (result.length <= 0) {
      response.status(401).json(`Member with this ${request.query.email} not found`);
    } else {
      const results = JSON.parse(JSON.stringify(result));
      results.map((rs) => {
        const password = compareSync(request.query.password, rs.password);
        if (password) {
          const token = jwt.sign({
            userId: rs.id,
            email: rs.email,
          }, 'asd', { expiresIn: 120 * 120 });

          response.status(200).json({ token });
        } else {
          response.status(401).json('Error');
        }
      });
    }
  });
});
//======================================================
const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
]

router.get('/posts', authenticateToken, (req, res) => {
  res.json(posts.filter(post => post.username === req.user.name))
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}
export default router;

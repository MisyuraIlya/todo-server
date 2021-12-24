// GLOBAL
import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';
// LOCAL
import db from './config.js';
import httpStatusCodes from './httpStatusCodes.js';

const LIMIT = 4;

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

function sendResponse(response, data = null, status = null, error = null) {
  return response.status(httpStatusCodes.status[status]).json({ status: httpStatusCodes.status[status], data, error });
}

class todoController {
  async CreateTodo(request, response) {
    const id = uuidv4();
    const { title, description } = request.body;
    const ended = null;
    const status = 'ACTIVE';
    const sql = 'INSERT INTO todo_list (id, title, created, ended, description, status) VALUES (?, ?, now(), ?, ?, ?)';
    const result = await query(sql, [id, title, ended, description, status]);
    sendResponse(response, result, 'OK', null);
  }

  async CreateSubTodo(request, response) {
    const id = uuidv4();
    const parentid = request.params.id;
    const ended = null;
    const subdescription = request.body.subDescription;
    const status = 'ACTIVE';
    const sql = 'INSERT INTO todo_sub (id, parentid, created, ended, subdescription, status) VALUES (?, ?, now(), ?, ?, ?)';
    const result = await query(sql, [id, parentid, ended, subdescription, status]);
    sendResponse(response, result, 'OK', null);
  }

  async ReadTodos(request, response) {
    const { status } = request.query;
    let sql = 'SELECT COUNT(id) AS count FROM todo_list WHERE status = ?';
    const result = await query(sql, status);
    const total = result[0].count;
    const numberOfPages = Math.ceil(total / LIMIT);
    const page = request.query.page ? Number(request.query.page) : 1;
    if (page > numberOfPages) {
      sendResponse(response, null, 'BAD_REQUEST', 'Number of pages higher ');
    }
    if (page > numberOfPages) {
      response.redirect(`/api/todos?page=${encodeURIComponent(numberOfPages)}`);
    } else if (page < 1) {
      response.redirect(`/api/todos?page=${encodeURIComponent('1')}`);
    }
    const startingLimit = (page - 1) * LIMIT;
    const limit = LIMIT;
    sql = `SELECT * FROM todo_list WHERE status = ? LIMIT ${startingLimit},${LIMIT} `;
    const resultAll = await query(sql, status);
    sendResponse(response, [resultAll, page, limit, total], 'OK', null);
  }

  async ReadTodoHistory(request, response) {
    const sql = 'SELECT * FROM todo_sub ;';
    const result = await query(sql);
    sendResponse(response, result, 'OK', null);
  }

  async ReadSubtodosPerId(request, response) {
    const { id } = request.params;
    if (uuidValidate(id)) {
      const sql = 'SELECT * FROM todo_sub WHERE parentid  = ?';
      const result = await query(sql, id);
      sendResponse(response, result, 'OK', null);
    } else {
      sendResponse(response, null, 'BAD_REQUEST', 'UUID is invalid');
    }
  }

  async UpdateTodos(request, response) {
    const { id } = request.params;
    if (uuidValidate(id)) {
      const sql = 'UPDATE todo_list SET status = \'DONE\' , ended = now()  WHERE id = ? ; ';
      const result = await query(sql, id);
      sendResponse(response, result, 'OK', null);
    } else {
      sendResponse(response, null, 'BAD_REQUEST', 'Not found in db this todo');
    }
  }

  async UpdateSubtodos(request, response) {
    const { id } = request.params;
    const { status } = request.params;
    if (status === 'DONE') {
      const sql = 'UPDATE todo_sub SET status = ? , ended = now()  WHERE id = ? ; ';
      const result = await query(sql, [status, id]);
      sendResponse(response, result, 'OK', null);
    } else {
      const sql = 'UPDATE todo_sub SET status = ? , ended = null  WHERE id = ? ; ';
      const result = await query(sql, [status, id]);
      sendResponse(response, result, 'OK', null);
    }
  }

  async DeleteTodo(request, response) {
    const { id } = request.params;
    if (uuidValidate(id)) {
      const sql = 'DELETE FROM todo_list WHERE id = ?';
      const result = await query(sql, id);
      sendResponse(response, result, 'OK', null);
    } else {
      sendResponse(response, null, 'BAD_REQUEST', 'There is no id in db to delete');
    }
  }

  async DeleteSubtodo(request, response) {
    const { id } = request.params;
    if (uuidValidate(id)) {
      const sql = 'DELETE FROM todo_sub WHERE id = ?';
      const result = await query(sql, id);
      sendResponse(response, result, 'OK', null);
    } else {
      sendResponse(response, null, 'BAD_REQUEST', 'There is no id in db to delete');
    }
  }
}

export default new todoController();

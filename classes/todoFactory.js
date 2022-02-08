import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import TodosModel from "../models/todo-model.js";
import SubTodosModel from "../models/subtodo-model.js";
import dotenv from 'dotenv';
import ApiError from "../exceptions/api-error.js";
import db from '../config.js';
dotenv.config();

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


class TodoMysql {
    constructor() {

    }

    async readTodo(status, limit, page){
        let sql = 'SELECT COUNT(_id) AS count FROM todo_list WHERE status = ?';
        const result = await query(sql, status);
        if(result[0].count  > 0){
          const total = result[0].count;
          const numberOfPages = Math.ceil(total / limit);
          if (page > numberOfPages) {
               throw ApiError.BadRequest(`no data found`)
          }
          if (page > numberOfPages) {
            response.redirect(`/api/todos?page=${encodeURIComponent(numberOfPages)}`);
          } else if (page < 1) {
            response.redirect(`/api/todos?page=${encodeURIComponent('1')}`);
          }
          const startingLimit = (page - 1) * limit;
          sql = `SELECT * FROM todo_list WHERE status = ? LIMIT ${startingLimit},${limit} `;
          const todos = await query(sql, status);
          return { todos, total}
        } else {
            throw ApiError.BadRequest(`no data found`)
        }
    }
    async createTodo(title, description){
        const _id = uuidv4();
        const ended = null;
        const status = 'ACTIVE';
        const sql = 'INSERT INTO todo_list (_id, title, created, ended, description, status) VALUES (?, ?, now(), ?, ?, ?)';
        const response = await query(sql, [_id, title, ended, description, status]);
        return response
    }
    async createSubTodo(parentid, subdescription){
        const _id = uuidv4();
        const ended = null;
        const status = 'ACTIVE';
        const sql = 'INSERT INTO todo_sub (_id, parentid, created, ended, subdescription, status) VALUES (?, ?, now(), ?, ?, ?)';
        const result = await query(sql, [_id, parentid, ended, subdescription, status]);
        return result
    }
    async readTodoSubHistory(){
        const sql = 'SELECT * FROM todo_sub ;';
        const result = await query(sql);
        return result
    }
    async readSubtodosPerId(id){
        if (uuidValidate(id)) {
          const sql = 'SELECT * FROM todo_sub WHERE parentid  = ?';
          const result = await query(sql, id);
        return result
        } else {
            throw ApiError.BadRequest(`no data found`)
        }
    }
    async updateTodos(_id){
        console.log(_id)
        if (uuidValidate(_id)) {
          const sql = 'UPDATE todo_list SET status = \'DONE\' , ended = now()  WHERE _id = ? ; ';
          const result = await query(sql, _id);
        return result
        } else {
          throw ApiError.BadRequest(`no data found`)
        }
    }
    async updateSubtodos(_id,status){
      console.log(_id,status)
        if (status === 'DONE') {
          const sql = 'UPDATE todo_sub SET status = ? , ended = now()  WHERE _id = ? ; ';
          const result = await query(sql, [status, _id]);
        return result
        } else {
          const sql = 'UPDATE todo_sub SET status = ? , ended = null  WHERE _id = ? ; ';
          const result = await query(sql, [status, _id]);
        return result
        }
    }
    async deleteTodo(_id){
      console.log(_id)
        if (uuidValidate(_id)) {
          const sql = 'DELETE FROM todo_list WHERE _id = ?';
          const result = await query(sql, _id);
        return result
        } else {
        throw ApiError.BadRequest(`no data found`)
        }
    }
    async deleteSubtodo(_id){
        if (uuidValidate(_id)) {
          const sql = 'DELETE FROM todo_sub WHERE _id = ?';
          const result = await query(sql, _id);
        return result
        } else {
        throw ApiError.BadRequest(`no data found`)
        }
    }
}

class TodoMongo {
    constructor() {
    }
    async readTodo(status, limit, page) {
        const todos = await TodosModel.find({status}).limit(limit * 1).skip((page - 1) * limit);
        const total = await TodosModel.count({status});
        if (!todos) {
            throw ApiError.BadRequest(`no data found`)
        }

        return {todos, total}
    }
    
    async createTodo(title, description){
      console.log(title, description)
        const response = await TodosModel.create({title,description})
        return response

    }
    async createSubTodo(parentid, subdescription){
      console.log(parentid, subdescription)
        const response = await SubTodosModel.create({parentid, subdescription})
        return response
    }
    async readTodoSubHistory(){
        const response = await SubTodosModel.find()
        return response
    }
    async readSubtodosPerId(id){
        const response = await SubTodosModel.find({parentid: id})
        return response 
    }
    async updateTodos(id){
        const response = await TodosModel.findByIdAndUpdate(id, {status: 'DONE', ended: Date.now()}, {new: true})
        return response
    }
    async updateSubtodos(id,status){
        if (status === 'DONE') {
            const response = await SubTodosModel.findByIdAndUpdate(id, {status : status, ended: Date.now() }, {new: true})
            if(!response) {
                throw ApiError.BadRequest(`no data found`)
            }
            return response
          } else {
            const response = await SubTodosModel.findByIdAndUpdate(id, {status : status, ended: null}, {new: true})
            if(!response) {
                throw ApiError.BadRequest(`no data found`)
            }
            return response
          }
    }
    async deleteTodo(id){
        const response = await TodosModel.findByIdAndDelete(id)
        return response
    }
    async deleteSubtodo(id){
        const response = await SubTodosModel.findByIdAndDelete(id)
        return response
    }
}

function TodoFactory() {
    switch (process.env.DB_TYPE ) {
        case 'mysql':
            return new TodoMysql();
        case 'mongodb':
            return new TodoMongo();
        default:
            throw new Error(`[TodoFactory] Unknown type ${process.env.DB_TYPE}`);
        
    }
}

export default TodoFactory;
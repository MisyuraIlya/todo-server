import TodosModel from "../models/todo-model.js";
import SubTodosModel from "../models/subtodo-model.js";
import ApiError from "../exceptions/api-error.js";
import TodoFactory from "../classes/todoFactory.js";

const todoss = TodoFactory();

class todoService {
    async CreateTodo(title, description) {
        const response = await todoss.createTodo(title,description)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async CreateSubTodo(parentid, subdescription){
        const response = await todoss.createSubTodo(parentid,subdescription)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async ReadTodos(page, limit, status){

        const {todos, total} = await todoss.readTodo(status, limit, page);
        return { response:todos, total };
    }

    async ReadTodoSubHistory(){
        const response = await todoss.readTodoSubHistory();
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async ReadSubtodosPerId(id){
        const response = await todoss.readSubtodosPerId(id)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async UpdateTodos(id){
        const response = await todoss.updateTodos(id)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response

    }

    async UpdateSubtodos(id, status){
        const response = await todoss.updateSubtodos(id,status)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async DeleteTodo(id){
        const response = await todoss.deleteTodo(id)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
        
    }

    async DeleteSubtodo(id){
        const response = await todoss.deleteSubtodo(id)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }
}

export default new todoService();
import TodosModel from "../models/todo-model.js";
import SubTodosModel from "../models/subtodo-model.js";
import ApiError from "../exceptions/api-error.js";
class todoService {
    async CreateTodo(title, description) {
        const response = await TodosModel.create({title,description})
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async CreateSubTodo(parentid, subdescription){
        const response = await SubTodosModel.create({parentid, subdescription})
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async ReadTodos(page, limit, status){
        const response = await TodosModel.find({status}).limit(limit * 1).skip((page - 1) * limit)
        const total = await TodosModel.count({status})
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return {response,total}
    }

    async ReadTodoSubHistory(){
        const response = await SubTodosModel.find()
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async ReadSubtodosPerId(id){
        const response = await SubTodosModel.find({parentid: id})
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
    }

    async UpdateTodos(id){
        const response = await TodosModel.findByIdAndUpdate(id, {status: 'DONE', ended: Date.now()}, {new: true})
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response

    }

    async UpdateSubtodos(id, status){
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

    async DeleteTodo(id){
        const response = await TodosModel.findByIdAndDelete(id)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response
        
    }

    async DeleteSubtodo(id){
        const response = await SubTodosModel.findByIdAndDelete(id)
        if(!response) {
            throw ApiError.BadRequest(`no data found`)
        }
        return response

    }
}

export default new todoService();
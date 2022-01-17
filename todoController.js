// GLOBAL
// LOCAL
import httpStatusCodes from './httpStatusCodes.js';
import Schema from './schema.js'

function sendResponse(response, data = null, status = null, error = null) {
  return response.status(httpStatusCodes.status[status]).json({ status: httpStatusCodes.status[status], data, error });
}

class todoController {

  async CreateTodo(request, response) {

    try{
      const {title,description} = request.body;
      const todo = await Schema.Todos.create({title, description})
      sendResponse(response, todo, 'OK', null);
    }catch(e) {
      sendResponse(response, null, 'BAD_REQUEST', e);
    }
  }

  async CreateSubTodo(request, response) {

    try{
      const parentid = request.params.id;
      const subdescription = request.body.subdescription
      const result = await Schema.SubTodos.create({parentid, subdescription})
      sendResponse(response, result, 'OK', null);
    } catch (error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async ReadTodos(request, response) {
    const { page = 1, limit = 10} = request.query;
    const result = await Schema.Todos.find().limit(limit * 1).skip((page - 1) * limit)
    sendResponse(response, {total: result.length, result}, 'OK', null);
  }

  async ReadTodoHistory(request, response) {
    const result = Schema.SubTodos.find()
    sendResponse(response, result, 'OK', null);
  }

  async ReadSubtodosPerId(request, response) {
    const {id} = request.params
    try{
      if (!id) {
        sendResponse(response, null, 'BAD_REQUEST', 'Id didnt writen');
      }
      const result = await Schema.SubTodos.find({parentid: id})
      sendResponse(response, result, 'OK', null);
    } catch (error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async UpdateTodos(request, response) {
    try {
      const todo = request.body
      if (!todo._id) {
        sendResponse(response, null, 'BAD_REQUEST', 'UUID is invalid');
      } 
      const updateTodo = await Schema.Todos.findByIdAndUpdate(todo._id, todo, {new: true})
      sendResponse(response, updateTodo, 'OK', null);
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', 'UUID is invalid');
    }
  }

  async UpdateSubtodos(request, response) {
    const { id } = request.params;
    const { status } = request.params;
    if (status === 'DONE') {
      const result = await Schema.SubTodos.findOneAndUpdate(id, {status : status }, {new: true})
      sendResponse(response, result, 'OK', null);
    } else {
      const result = await Schema.SubTodos.findOneAndUpdate(id, {status : status }, {new: true})
      sendResponse(response, result, 'OK', null);
    }
  }

  async DeleteTodo(request, response) {
    try{
      const {id}  = request.params
      if(!id) {
        sendResponse(response, null, 'BAD_REQUEST', 'no id send');
      }
      const todo = await Schema.Todos.findByIdAndDelete(id)
      sendResponse(response, todo, 'OK', null);
    } catch (error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async DeleteSubtodo(request, response) {
    const { id } = request.params;
    try{
      const result = await Schema.SubTodos.findByIdAndDelete(id)
      sendResponse(response, result, 'OK', null);
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }
}

export default new todoController();

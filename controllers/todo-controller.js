// GLOBAL
// LOCAL
import httpStatusCodes from '../httpStatusCodes.js';
import todoService from '../service/todo-service.js';
// import Schema from './schema.js'

function sendResponse(response, data = null, status = null, error = null) {
  return response.status(httpStatusCodes.status[status]).json({ status: httpStatusCodes.status[status], data, error });
}

class todoController {

  async CreateTodo(request, response) {

    try{
      const {title,description} = request.body;
      const result = await todoService.CreateTodo(title, description)
      sendResponse(response, result, 'OK', null);
    }catch(e) {
      sendResponse(response, null, 'BAD_REQUEST', e);
    }
  }

  async CreateSubTodo(request, response) {

    try{
      const parentid = request.params.id;
      const subdescription = request.body.subDescription
      const result = await todoService.CreateSubTodo(parentid, subdescription)
      sendResponse(response, result, 'OK', null);
    } catch (error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async ReadTodos(request, response) {
      try{
            const { page = 1, limit = 2, status} = request.query;
            const result = await todoService.ReadTodos(page, limit, status)
            const data = result.response
            const total = result.total
            sendResponse(response, {total: total, limit: limit, data}, 'OK', null);
        } catch (error) {
            sendResponse(response, null, 'BAD_REQUEST', error);
        }
  }

  async ReadTodoSubHistory(request, response) {
      try{
            const result = await todoService.ReadTodoSubHistory()
            sendResponse(response, result, 'OK', null);
        } catch (error) {
            sendResponse(response, null, 'BAD_REQUEST', error);
        }
  }

  async ReadSubtodosPerId(request, response) {
      try{
            const {id} = request.params
            const result = await todoService.ReadSubtodosPerId(id)
            sendResponse(response, result, 'OK', null);
        } catch (error) {
            sendResponse(response, null, 'BAD_REQUEST', error);
        }
  }

  async UpdateTodos(request, response) {
      try{
        const { id } = request.params;
        const result = await todoService.UpdateTodos(id)
        sendResponse(response, result, 'OK', null);
        } catch (error) {
            sendResponse(response, null, 'BAD_REQUEST', error);
        }
  }

  async UpdateSubtodos(request, response) {
      try{
        const { id , status } = request.params;
        const result = await todoService.UpdateSubtodos(id , status)
        sendResponse(response, result, 'OK', null);
    } catch (error) {
        sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async DeleteTodo(request, response) {
    try{
      const {id}  = request.params
      const test = request.params
      const result = await todoService.DeleteTodo(id)
      sendResponse(response, result, 'OK', null);
    } catch (error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }

  async DeleteSubtodo(request, response) {
    try{
      const { id } = request.params;
      const result = await todoService.DeleteSubtodo(id)
      sendResponse(response, result, 'OK', null);
    } catch(error) {
      sendResponse(response, null, 'BAD_REQUEST', error);
    }
  }
}

export default new todoController();

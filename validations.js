import { body, validationResult } from 'express-validator';
import httpStatusCodes from './httpStatusCodes.js';

function sendResponse(response, data = null, status = null, error = null) {
  return response.status(httpStatusCodes.status[status]).json({ status: httpStatusCodes.status[status], data, error });
}

class validation {
  validatePostTodos(request, response, next) {
    const { title, description } = request.body;
    if (!title || !description) {
      sendResponse(response, null, 'BAD_REQUEST', 'title didnt writen', null);
    }
    return next();
  }

  validatePostSubTodos(request, response, next) {
    const parentid = request.params.id;
    const { subDescription } = request.body;
    if (!parentid || !subDescription) {
      sendResponse(response, null, 'BAD_REQUEST', 'title didnt writen', null);
    }
    return next();
  }

  validationGetAllTodos(request, response, next) {
    const { status } = request.query;
    const { page } = request.query;
    if ((status === 'ACTIVE' || status === 'DONE') && !isNaN(page)) {
      return next();
    }
    sendResponse(response, null, 'BAD_REQUEST', 'title didnt writen', null);
  }

  validationPutSubtodosStatus(request, response, next) {
    const { id } = request.params;
    const { status } = request.params;
    if (status == 'ACTIVE' || status == 'DONE') {
      return next();
    }
    sendResponse(response, null, 'BAD_REQUEST', 'title didnt writen', null);
  }

  validationEmail() {
    return [
      body('email').isEmail(),
      body('password').isLength({ min: 5 }),
    ];
  }

  validationSignUp(request, response, next) {
    const extractedErrors = [];

    const errors = validationResult(request);
    const { name } = request.body;
    const { lastname } = request.body;
    const { phone } = request.body;
    
    if (errors.isEmpty() && isNaN(name) && isNaN(lastname) && !isNaN(phone)) {
      return next();
    } else {
      if(!isNaN(name)) {
        extractedErrors.push({name:'name contain number'})
      }
      if(!isNaN(lastname)){
        extractedErrors.push({lastname: 'lastname contain number'})
      }
      if(isNaN(phone)){
        extractedErrors.push({phone: 'phone contain caracther'})
      }
    } 

    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
     sendResponse(response, null, 'ENTITY', extractedErrors);
  }
}

export default new validation();

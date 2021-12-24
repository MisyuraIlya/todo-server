import { body, validationResult } from 'express-validator';

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
    const data = validateData();
    console.log(data);
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
    const errors = validationResult(request);
    const { name } = request.body;
    const { lastname } = request.body;
    const { phone } = request.body;
    if (errors.isEmpty() && isNaN(name) && isNaN(lastname) && !isNaN(phone)) {
      return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
    return response.status(422).json({
      errors: extractedErrors,
    });
  }
}

export default new validation();

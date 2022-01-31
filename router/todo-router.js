import Router from 'express';
import todoController from '../controllers/todo-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';

const routerTodo = new Router();

routerTodo.post('/todos', todoController.CreateTodo);
routerTodo.post('/todos/:id/subtodos/', todoController.CreateSubTodo);
routerTodo.get('/todos',authMiddleware, todoController.ReadTodos);
routerTodo.get('/subhistory', todoController.ReadTodoSubHistory);
routerTodo.get('/subtodos/:id', todoController.ReadSubtodosPerId); 
routerTodo.put('/todos/:id', todoController.UpdateTodos); 
routerTodo.put('/subtodos/update/:id/:status', todoController.UpdateSubtodos);
routerTodo.delete('/todos/:id', todoController.DeleteTodo); 
routerTodo.delete('/subtodos/:id', todoController.DeleteSubtodo); 

export default routerTodo
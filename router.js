// GLOBAL
import Router from 'express';
// LOCAL
import todoController from './todoController.js';
import authController from './authController.js';
import validations from './validations.js';

const router = new Router();
router.post('/todos', validations.validatePostTodos, todoController.CreateTodo);
router.post('/todos/:id/subtodos/', validations.validatePostSubTodos, todoController.CreateSubTodo);
router.get('/todos', validations.validationGetAllTodos, todoController.ReadTodos);
router.get('/subhistory', todoController.ReadTodoHistory);// no need validate
router.get('/subtodos/:id', todoController.ReadSubtodosPerId); // no need validate
router.put('/todos/:id', todoController.UpdateTodos); // no need validate
router.put('/subtodos/update/:id/:status', validations.validationPutSubtodosStatus, todoController.UpdateSubtodos);
router.delete('/todos/:id', todoController.DeleteTodo); // no need validate
router.delete('/subtodos/:id', todoController.DeleteSubtodo); // no need validate
// need to fix more
router.post('/auth/signup', validations.validationEmail(), validations.validationSignUp, authController.SignUp);
router.post('/send-email', authController.SendEmail);
router.get('/verify-email', authController.VerifyEmail);
router.get('/auth/signin', authController.SignIn);
router.get('/home', authController.Home);
router.get('/logout', authController.LogOut);
router.post('/reset-password-email', authController.ResetPassword);
router.post('/update-password', authController.UpdatePassword);
export default router;

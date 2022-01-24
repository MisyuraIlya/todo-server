// // GLOBAL
// import Router from 'express';
// // LOCAL
// // import todoController from './todoController.js';
// // import authController from './authController.js';
// import validations from './validations.js';

// const router = new Router();
// router.post('/todos', /*validations.validatePostTodos,*/ todoController.CreateTodo);
// router.post('/todos/:id/subtodos/', /*validations.validatePostSubTodos,*/ todoController.CreateSubTodo);
// router.get('/todos', /*validations.validationGetAllTodos, */ todoController.ReadTodos);
// router.get('/subhistory', todoController.ReadTodoHistory);
// router.get('/subtodos/:id', todoController.ReadSubtodosPerId); 
// router.put('/todos', todoController.UpdateTodos); 
// router.put('/subtodos/update/:id/:status', validations.validationPutSubtodosStatus, todoController.UpdateSubtodos);
// router.delete('/todos/:id', todoController.DeleteTodo); 
// router.delete('/subtodos/:id', todoController.DeleteSubtodo); 


// // router.post('/auth/signup', validations.validationEmail(), validations.validationSignUp , authController.SignUp);
// // router.post('/send-email', authController.SendEmail);
// // router.get('/verify-email', authController.VerifyEmail);
// // router.post('/auth/token', authController.VerifyRefreshToken, authController.Token)
// // router.post('/auth/signin', authController.SignInPost);
// // router.get('/auth/signin', authController.VerifyToken, authController.SignInGet) 
// // router.get('/home',authController.VerifyToken, authController.Homepage);
// // router.get('/auth/logout', authController.VerifyToken, authController.LogOut);
// // router.post('/reset-password', authController.ResetPassword);
// // router.post('/update-password', authController.UpdatePassword);
// router.post('/registration');
// router.post('/login');
// router.post('/logout');
// router.get('/activate/:link');
// router.get('/refresh');
// router.get('/users');
// export default router;

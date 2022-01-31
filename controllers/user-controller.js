import userService from "../service/user-service.js";
import httpStatusCodes from '../httpStatusCodes.js';
import {validationResult}  from 'express-validator';
import ApiError from "../exceptions/api-error.js";

function sendResponse(response, data = null, status = null, error = null) {
    return response.status(httpStatusCodes.status[status]).json({ status: httpStatusCodes.status[status], data, error });
  }

class UserController {

    async registration(request, response, next) {
        try{
            const errors = validationResult(request);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Invaild validation',errors.array()))
            }
            const {name, lastname, email, password, phone} = request.body;
            const userData =  await userService.registration(name, lastname, email, password, phone);
            response.cookie('refreshToken', userData.refreshToken, {maxAge:  30 * 24 * 60 * 60 * 1000, httpOnly: true})
            sendResponse(response, userData, 'OK', null);
        } catch(error){
            // sendResponse(response, null, 'BAD_REQUEST', error);
            next(error);
        }
    }

    async login(request, response, next) {
        try{
            const {email, password} = request.body;
            const userData = await userService.login(email, password)
            response.cookie('refreshToken', userData.refreshToken, {maxAge:  30 * 24 * 60 * 60 * 1000, httpOnly: true})
            sendResponse(response, userData, 'OK', null);
        } catch(error){
            
        }
    }

    async logout(request, response, next) {
        try{
            const {refreshToken} = request.cookies;
            const token = await userService.logout(refreshToken)
            response.clearCookie('refreshToken');
            sendResponse(response, 'logouted suc', 'OK', null);
        } catch(error){
            next(error);
        }
    }

    async activate(request, response, next) {
        try{
            const activationLink = request.params.link
            await userService.activate(activationLink)
            // return response.redirect(process.env.CLIENT_URL) // use if fronend and backend different hosts
            sendResponse(response, 'succsesfuly activate', 'OK', null);
        } catch(error){
            // sendResponse(response, null, 'BAD_REQUEST', error);
            next(error);
        }
    }

    async refresh(request, response, next) {
        try{
            const {refreshToken} = request.cookies;
            const userData = await userService.refresh(refreshToken)
            response.cookie('refreshToken', userData.refreshToken, {maxAge:  30 * 24 * 60 * 60 * 1000, httpOnly: true})
            sendResponse(response, userData, 'OK', null);
        } catch(error){
            next(error);
        }
    }

    async getUsers(request, response, next) {
        try{
            const users = await userService.getAllUsers();
            sendResponse(response, users, 'OK', null);
        } catch(error){
            next(error);
        }
    }

}

export default new UserController();
import userService from "../service/user-service.js";
import httpStatusCodes from '../httpStatusCodes.js';
import {validationResult}  from 'express-validator';
import ApiError from "../exceptions/api-error.js";
import dotenv from 'dotenv';
dotenv.config();

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
            sendResponse(response, userData, 'OK', null);
        } catch(error){
            next(error);
        }
    }

    async login(request, response, next) {
        try{
            const {email, password} = request.body;
            const userData = await userService.login(email, password)
            switch (process.env.DB_TYPE ) {
                case 'mysql':
                    return request.session.user = userData, sendResponse(response, userData, 'OK', null);;
                case 'mongodb':
                    return sendResponse(response, userData, 'OK', null);
                default:
                    throw new Error(`[TodoFactory] Unknown type ${process.env.DB_TYPE}`);
            }
            
        } catch(error){
            
        }
    }

    async logout(request, response, next) {
        try{
            const {refreshToken} = request.cookies;
            const {userId} = request.cookies;
            switch (process.env.DB_TYPE ) {
                case 'mysql':
                    const tokenMysql = await userService.logout(userId)
                    return response.clearCookie('userId'), sendResponse(response, tokenMysql, 'OK', null);
                case 'mongodb':
                    const tokenMongo = await userService.logout(refreshToken)
                    return response.clearCookie('refreshToken'), sendResponse(response, tokenMongo, 'OK', null);
                default:
                    throw new Error(`[TodoFactory] Unknown type ${process.env.DB_TYPE}`);
            }

        } catch(error){
            next(error);
        }
    }

    async activate(request, response, next) {
        try{
            const activationLink = request.params.link
            await userService.activate(activationLink)
            return response.redirect(`${process.env.CLIENT_URL}/signin`) // use if fronend and backend different hosts
        } catch(error){
            next(error);
        }
    }

    async refresh(request, response, next) {
        try{
            const {userId} = request.cookies;
            const userData = await userService.refresh(userId)
            sendResponse(response, userData, 'OK', null);
        } catch(error){
            next(error);
        }
    }

    async resetPassword(request, response, next){
        try{
            const { email } = request.body;
            const userData = await userService.resetPassword(email)
            sendResponse(response, 'Update password link send to your email', 'OK', null)
        } catch(error){
            next(error);
        }
    }

    async updatedPassword(request, response, next){
        try{
          const { token, password } = request.body;
          const userData = await userService.updatedPassword(token,password)
          sendResponse(response, 'Password Successfully updated', 'OK', null)
        } catch(error){
            next(error);
        }   
    }
}

export default new UserController();
import User from "../models/user-model.js";
import mailService from "./mail-service.js";
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import ApiError from "../exceptions/api-error.js";
import AuthFactory from "../classes/authFactory.js";
import dotenv from 'dotenv';
dotenv.config();

const UserFactory = AuthFactory();
  
class UserService {
    async registration(name, lastname, email, password, phone) {
      const response = await UserFactory.registration(name, lastname, email, password, phone)
      return response
    }

    async activate(activationLink){
      const response = await UserFactory.activate(activationLink)
      return response
    }

    async login(email, password){
      const response = await UserFactory.login(email, password)
      return response 
    }

    async logout(refreshToken){
      const token = await UserFactory.logout(refreshToken)
      return token;
    }

    async refresh(userId){
      const response = await UserFactory.refresh(userId)
      return response
    }

    async getAllUsers() {
      const response = await UserFactory.getAllUsers();
      return response
    }

    async resetPassword(email){
        const response = await UserFactory.resetPassword(email)
        return response
  }

    async updatedPassword(token, password){
        const response = await UserFactory.updatedPassword(token, password)
        return response
    }
    
}

export default new UserService();
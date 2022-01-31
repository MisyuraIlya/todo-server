import User from "../models/user-model.js";
import mailService from "./mail-service.js";
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import ApiError from "../exceptions/api-error.js";
import dotenv from 'dotenv';
dotenv.config();
  
class UserService {
    async registration(name, lastname, email, password, phone) {
            const candidate = await User.findOne({email})
            if (candidate) {
              throw ApiError.BadRequest(`email with this ${email} used`)
            } else {
            const hashPassword = await bcrypt.hash(password, 3)
            const activationLink = uuidv4();
            const user = await User.create({name:name, lastname:lastname, email:email, password:hashPassword, phone:phone, activationLink})
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
            const userDto = new UserDto(user); //id email isActivated
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id,tokens.refreshToken)
            return { ...tokens, user:userDto}
            }
    }

    async activate(activationLink){
      const user = await User.findOne({activationLink})
      if(!user){
        throw ApiError.BadRequest('Invalid link')
      }
      user.isActivated = true;
      await user.save();
    }

    async login(email, password){
      const user = await User.findOne({email})
      if (!user){
        throw ApiError.BadRequest('Account with this email didnt find') 
      }
      const isPasswordEquals = await bcrypt.compare(password, user.password)
      if (!isPasswordEquals) {
        throw ApiError.BadRequest('Uncorrect password')
      }
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id,tokens.refreshToken)
      return { ...tokens, user:userDto}
    }

    async logout(refreshToken){
      const token = await tokenService.removeToken(refreshToken);
      return token;
    }

    async refresh(refreshToken){
      if(!refreshToken){
        throw ApiError.UnauthirizedError();
      }
      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);
      if(!userData || !tokenFromDb) {
          throw ApiError.UnauthirizedError();
      }
      const user = await User.findById(userData.id);
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id,tokens.refreshToken)
      return { ...tokens, user:userDto}
    }

    async getAllUsers() {
      const users = await User.find();
      return users;
    }
}

export default new UserService();
import dotenv from 'dotenv';
import ApiError from "../exceptions/api-error.js";
import bcrypt from 'bcrypt'
import UserDto from '../dtos/user-dto.js';
import mailService from '../service/mail-service.js';
import User from '../models/user-model.js';
import tokenService from '../service/token-service.js';
import db from '../config.js';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();


function query(sql, params) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }


class TodoMysql {
    constructor() {

    }
    async registration(name, lastname, email, password, phone){
        const sql = 'SELECT _id, email, name FROM users WHERE email = ?';
        const result = await query(sql, email);
        if (typeof result !== 'undefined' && result.length > 0) {
          const results = JSON.parse(JSON.stringify(result));
          results.map((rs) => {
            throw ApiError.BadRequest(`member with this - ${rs.email} already registered`) 
          });
        } else {
          const _id = uuidv4();
          const activationLink = uuidv4();
          const hashPassword = await bcrypt.hash(password, 3)
          await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
          const sql = 'INSERT INTO users (_id, name, lastname, email, password, phone, created, status) VALUES(?, ?, ?, ?, ?, ?, now(), \'DISABLED\') ';
          const sql2 = 'INSERT INTO verefication (_id, email, token, verify, created, updated) VALUES(?, ?, ?, 0, now(), now())';
          const result = await query(sql, [_id, name, lastname, email, hashPassword, phone]);
          const result2 = await query(sql2, [_id, email, activationLink]);
        //   sendResponse(response, 'Account created succsesfuly verify account in email', 'OK', null);
        return result
        }
    }
    
    async login(email, password){
        const sql = 'SELECT _id,name, email, password FROM users WHERE email = ? AND status = \'ACTIVE\' ';
        const validateEmail = await query(sql, email, (err, result, fields) => {
            if (err) {
              throw ApiError.BadRequest(`Error bad request`) 
            } else {
                return true
            }
          });
        if (validateEmail.length > 0) {
            const sqlStatus = 'SELECT status FROM users WHERE email = ?  ';
            const validateStatus = await query(sqlStatus, email, (err, resultStatus, fields) => {
                return resultStatus
             });
            if (validateStatus[0].status != 'ACTIVE') {
                throw ApiError.BadRequest(`Verify account in email before signin'`) 
            }
            const results = JSON.parse(JSON.stringify(validateEmail));
            const data = results.map((response) => {
            return response
            });
            const isPasswordEquals = await bcrypt.compare(password, data[0].password)
            if(isPasswordEquals) {
                return validateEmail
            } else {
                throw ApiError.BadRequest(`BAD_REQUEST', 'password inccorect`) 
            }
        } else {
            throw ApiError.BadRequest(`BAD_REQUEST', 'Email inccorect`) 
        }
    }

    async logout(){

    }
    
    async activate(token){
        const sql = 'SELECT * FROM verefication WHERE token = ?';
        const data = await query(sql, token, (err, result) => { 
            if (err)  throw ApiError.BadRequest(`Error bad request ${err}`);
            if (result.length > 0) {    
                return result
            } else if(result[0].verify == 0){
                throw ApiError.BadRequest(`The email has been already verified`);
            }else {
                throw ApiError.BadRequest(`Error bad request ${err}`);
            }
        });
        const sql2 = 'UPDATE verefication SET verify = 1 WHERE email = ? ';
        const changedData = await query(sql2, [data[0].email] , (err, result) => { 
            if(err) throw ApiError.BadRequest(`Error bad request ${err}`);
            return result
        })
        return changedData
    }

    async resetPassword(email){
        const sql = 'SELECT * FROM users WHERE email = ? ';
        const data = await query(sql, email, (err, result) => {
        if (err) throw ApiError.BadRequest(`Error bad request ${err}`);
            return result
        });    
        const token = uuidv4();
        if (data) {
            const send =  await mailService.sendResetPasswordMail(email, `${process.env.CLIENT_URL}/newpassword?token=${token}`)
        }
        const sql2 = 'UPDATE users SET  token = ? WHERE email = ?';
        const updateToken =  await query(sql2, [token, email], (err, result) => { 
            if (err) throw ApiError.BadRequest(`Error bad request ${err}`);
            return result
        });
        return updateToken
        }
    
    async updatedPassword(token,password){
        const sql = 'SELECT * FROM users WHERE token = ?';
        const data = await query(sql, token, (err, result) => {
          if (err) throw ApiError.BadRequest(`Token invaild ${err}`);
            return result
        });
        const hashPassword = await bcrypt.hash(password, 3)
        const sql2 = 'UPDATE users SET password = ?  WHERE email = ?';
        const changedPassword = query(sql2,  [hashPassword, data[0].email] , (err, result) => {
            if (err) throw ApiError.BadRequest(`Password changing error ${err}`);
            return result
        });
        const sql3 = 'UPDATE users SET token = null WHERE email = ?';
        const changeToken = query(sql3, [data[0].email], (err, result) => {
            if (err) throw ApiError.BadRequest(`Chaning token null error ${err}`);
            return result
        })
        return changedPassword
    }
}

class TodoMongo {
    constructor() {
    
    }
async registration(name, lastname, email, password, phone){
    const candidate = await User.findOne({email})
    if(candidate) {
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

async login(email, password){
    const user = await User.findOne({email})
    if (!user){
      throw ApiError.BadRequest('Account with this email didnt find') // not work
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

async activate(activationLink){
    const user = await User.findOne({activationLink})
    if(!user){
      throw ApiError.BadRequest('Invalid link')
    }
    user.isActivated = true;
    const response =await user.save();
    return response
  }

  async logout(refreshToken){
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(userId){
    if(!userId){
      throw ApiError.UnauthirizedError();
    }
    const refreshToken = await tokenService.findToken(userId)
    const userData = tokenService.validateRefreshToken(refreshToken);
    if(!userData || !refreshToken) {
        throw ApiError.UnauthirizedError();
    }
    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});
    await tokenService.saveToken(userDto.id,tokens.refreshToken)
    return { ...tokens, user:userDto}
  }        

  async resetPassword(email){
    const user = await User.findOne({email})
    const token = uuidv4();
    await mailService.sendResetPasswordMail(email, `${process.env.CLIENT_URL}/newpassword?token=${token}`)
    const data = await User.findByIdAndUpdate(user.id, {token: token})
    return data
    }

  async updatedPassword(token,password){
      const user = await User.findOne({token: token});
      const hashPassword = await bcrypt.hash(password, 3);
      const changedPassword = await User.findByIdAndUpdate(user.id,{password:hashPassword});
      const changedTokenNull = await User.findByIdAndUpdate(user.id,{token:null});
      return changedPassword

}
}

function AuthFactory() {
    switch (process.env.DB_TYPE ) {
        case 'mysql':
            return new TodoMysql();
        case 'mongodb':
            return new TodoMongo();
        default:
            throw new Error(`[TodoFactory] Unknown type ${process.env.DB_TYPE}`);
        
    }
}

export default AuthFactory;
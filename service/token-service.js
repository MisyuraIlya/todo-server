
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import TokenModel from '../models/token-model.js'

dotenv.config();
class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET , {expiresIn: process.env.JWT_ACCESS_TIME})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        }catch (error) {
            return null;
        }
    }

    validateRefreshToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        }catch (error) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await TokenModel.findOne(userId)
        if (tokenData) {
            tokenData.refreshToken =  refreshToken
            return tokenData.save();
        } 

        const token = await TokenModel.create({user: userId, refreshToken})
        return token;
    }

    async removeToken(refreshToken){
        const tokenData = await TokenModel.deleteOne({refreshToken})
        return tokenData;
    }

    async findToken(refreshToken){
        const tokenData = await TokenModel.findOne({refreshToken})
        return tokenData;
    }

}

export default new TokenService();

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redis_client from '../redis_connect.js'
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
        const tokenData = await redis_client.get(userId.toString())
        if (tokenData) {
             const redis = await redis_client.set(userId.toString(),  refreshToken);
            return redis
        } 
        const token = await redis_client.set(userId.toString(), refreshToken)
        return token;
    }

    async removeToken(refreshToken){
        const tokenData = await redis_client.del(refreshToken)
        return tokenData;
    }

    async findToken(userId, refreshToken){
        const tokenData = await redis_client.get(userId)
        return tokenData;
    }

}

export default new TokenService();
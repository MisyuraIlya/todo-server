import mongoose from 'mongoose'
const { Schema } = mongoose;

const Token = new mongoose.Schema({
    user: {type: 'objectId', ref: 'User'},
    refreshToken: {type: String, required: true}
    
})

const TokenModel = mongoose.model('Token', Token)

export default TokenModel;
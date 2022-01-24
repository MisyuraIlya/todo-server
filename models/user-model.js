import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    lastname: {type: String, required:true},
    email: {type:String, required:true},
    password: {type: String, required:true},
    phone: {type: Number, required:true},
    created: {type: Date, default: Date.now},
    activationLink: {type: String, default:null},
    isActivated: {type:Boolean, default:false}
    
})

const User = mongoose.model('User', UserSchema)
export default User
import mongoose from 'mongoose'

const Todo = new mongoose.Schema({
    title: {type: String, required: true},
    created:  {type: Date, default: Date.now},
    ended: {type: Date, default: null},
    description: {type: String, required: true},
    status: {type: String, default:'ACTIVE'}

})

const SubTodo = new mongoose.Schema({
    parentid: {type: String, required: true},
    created: {type: Date, default: Date.now},
    ended: {type: Date, default: null},
    subdescription: {type: String, required: true},
    status: {type: String, default:'ACTIVE'}
})

const user = new mongoose.Schema({
    name: {type: String, required: true},
    lastname: {type: String, required:true},
    email: {type:String, required:true},
    password: {type: String, required:true},
    phone: {type: Number, required:true},
    created: {type: Date, default: Date.now},
    activationLink: {type: String, default:null},
    confirmed: {type:Boolean, default:false}
    
})

const Todos = mongoose.model('Todo', Todo)
const SubTodos = mongoose.model('SubTodo', SubTodo)
const Users = mongoose.model('Users', user)

const Schema = { Todos, SubTodos, Users}
export default Schema ;
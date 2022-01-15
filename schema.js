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

const Todos = mongoose.model('Todo', Todo)
const SubTodos = mongoose.model('SubTodo', SubTodo)

const Schema = { Todos, SubTodos}
export default Schema ;
import mongoose from 'mongoose'

const SubTodo = new mongoose.Schema({
    parentid: {type: String, required: true},
    created: {type: Date, default: Date.now},
    ended: {type: Date, default: null},
    subdescription: {type: String, required: true},
    status: {type: String, default:'ACTIVE'}
})

const SubTodosModel = mongoose.model('SubTodo', SubTodo)
export default SubTodosModel
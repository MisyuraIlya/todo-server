import mongoose from 'mongoose'

const Todo = new mongoose.Schema({
    title: {type: String, required: true},
    created:  {type: Date, default: Date.now},
    ended: {type: Date, default: null},
    description: {type: String, required: true},
    status: {type: String, default:'ACTIVE'}

})

const TodosModel = mongoose.model('Todo', Todo)
export default TodosModel
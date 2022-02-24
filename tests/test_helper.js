const User = require('../models/user')
const Todo = require('../models/todo')

const initialTodos = [
  {
    content: 'First todo',
    date: new Date(),
    important: false,
    done: false
  },
  {
    content: 'Second todo',
    date: new Date(),
    important: true,
    done: false
  },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const nonExistingId = async () => {
  const todo = new Todo({ content: 'willremovethissoon', date: new Date() })
  await todo.save()
  await todo.remove()

  return todo._id.toString()
}

const todosInDb = async () => {
  const todos = await Todo.find({})
  return todos.map(todo => todo.toJSON())
}

module.exports = {
  initialTodos, nonExistingId, todosInDb, usersInDb,
}
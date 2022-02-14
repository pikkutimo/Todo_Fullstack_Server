const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://admin:${password}@cluster0.ag0nh.mongodb.net/todoApp?retryWrites=true&w=majority`

mongoose.connect(url)

const todoSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Todo = mongoose.model('Todo', todoSchema)

// const todo = new Todo({
//   content: 'Alusta MongoAtlas',
//   date: new Date(),
//   important: true,
// })

// todo.save().then(result => {
//   console.log('todo saved!')
//   mongoose.connection.close()
// })

Todo.find({}).then(result => {
    result.forEach(todo => { 
        console.log(todo)
    })
    mongoose.connection.close()
})
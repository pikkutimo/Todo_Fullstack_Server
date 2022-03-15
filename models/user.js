const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  email: String,
  todos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returedObject) => {
    returedObject.id = returedObject._id.toString()
    delete returedObject.email
    delete returedObject._id
    delete returedObject.__v
    // The passwordHash should not be revealed
    delete returedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
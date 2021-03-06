const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: String,
  email: {
    type: String,
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
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
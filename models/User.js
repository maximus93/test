const mongoose = require ('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');
const user_schema = new mongoose.Schema ({
  name: {
      type: String,
      required: 'Name is Required',
    },
    email: {
      type: String,
      required: 'Email is Required',
    },
    password:{
      type: String,
      required: 'Password is required',
    },
    phone:{
      type: String,
      required: 'Phone is required',
    },
    addeddate: {
      type: String,
      default: Date.now,
    }
});
user_schema.plugin (uniqueValidator);
module.exports = mongoose.model ('User', user_schema);
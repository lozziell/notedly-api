// THIS IS THE DB SCHEMA FOR USER

// Require the mongoose library
const mongoose = require('mongoose');

//Define the user database schema
const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			index: { unique: true }
		},
		email: {
			type: String,
			required: true,
			index: { unique: true }
		},
		password: {
			type: String,
			required: true
		},
		avatar: {
			type: String
		}
	},
	{
		//Assign createAt and updatedAt fields with a Date type
		timestamps: true
	}
);

//Define the 'User' model with the schema
const User = mongoose.model('User', UserSchema);

//Export the module
module.exports = User;
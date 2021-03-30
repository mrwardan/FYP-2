const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		fullName: {
			type: String,
			require: true
		},
		username: {
			type: String,
			required: true,
			unique: true,  
		},
		major: {
			type: String,
			required: true,
			 
		},
		phone: {
			type: String,
			required: true,
			 
		},
		image: {
			type: String,
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
	}
)

const model = mongoose.model('user', UserSchema)

module.exports = model


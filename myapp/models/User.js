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
		image: {
			type: String,
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
	},{
		collation: 'users'
	}
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model


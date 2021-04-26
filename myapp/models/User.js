const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true
		},userId: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		resetCode: {
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


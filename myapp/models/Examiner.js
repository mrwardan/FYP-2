const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true
		},
		postion: {
			type: String,

		},
		staffNo: {
			type: String,
			required: true,
			unique: true
		},
		major: {
			type: String,
			required: true

		},
		institute: {
			type: String,

		},
		phone: {
			type: String,

		},
		createdAt: {
			type: Date,
			default: Date.now
		},
	}
)

const model = mongoose.model('examiner', UserSchema)

module.exports = model


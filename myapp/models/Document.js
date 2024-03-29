const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		supervisorId: {
			type: String,
			required: true
		},
		studentId: {
			type: String,
			required: true


		},
		documentName: {
			type: String,
			required: true

		},
		fileType: {
			type: String,
			required: true

		},
		createdAt: {
			type: Date,
			default: Date.now
		},

	}
)

const model = mongoose.model('document', UserSchema)

module.exports = model


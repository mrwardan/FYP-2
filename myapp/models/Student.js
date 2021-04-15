const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true
		},
		matricNo: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
			unique: true

		},
		phone: {
			type: String,

		},
		faculty: {
			type: String,
		},
		major: {
			type: String,
			required: true

		},
		semester: {
			type: String,
		},
		supervisorId: {
			
			type: mongoose.Schema.Types.ObjectId,
    ref: 'supervisor'
		},
		nationality: {
			type: String,
		},
		thesisTitle: {
			type: String,
		},
		imageLink: {
			type: String,
		},
		status: {
			type: String,
		},
		internalExaminerApproved: {
			type: Boolean,
		},
		externalExaminerApproved: {
			type: Boolean,
		},
		chairPersonName: {
			type: String,
		},
		internalExaminerId: {
			
			type: mongoose.Schema.Types.ObjectId,
			ref: 'examiner'
		},
		externalExaminerId: {
			
			type: mongoose.Schema.Types.ObjectId,
			ref: 'examiner'
			 
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
	}
)

const model = mongoose.model('student', UserSchema)

module.exports = model


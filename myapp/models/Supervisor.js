const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		fullName: {  		

			type: String,
			
		},
		staffNo: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
		


		},
		postion: {
			type: String,

		},
		major: {
			type: String,
			

		},
		institute: {
			type: String,

		},
		phoneNo: {
			type: String,

		},
		createdAt: {
			type: Date,
			default: Date.now
		},
	}
)

const model = mongoose.model('supervisor', UserSchema)

module.exports = model


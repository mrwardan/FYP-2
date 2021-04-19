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
			unique: true

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
		phone: {
			type: String,

		},
		image: {
			type: String,
			default: 'wardan.jpg',
		  },
		createdAt: {
			type: Date,
			default: Date.now
		},
	}
)

const model = mongoose.model('supervisor', UserSchema)

module.exports = model


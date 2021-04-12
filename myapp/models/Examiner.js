const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		email:{
			type: String,
			unique: true


		},
		fullName: {
			type: String,
			required: true
		},
		staffNo: {
			type: String,
			required: true,
			unique: true
		},
		phone: {
			type: String,

		},
		examinerType: {
			type: String,

		}, 
		postion: {
			type: String,

		}, 
		
		major: {
			type: String,
			required: true

		},
		institute: {
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

const model = mongoose.model('examiner', UserSchema)

module.exports = model


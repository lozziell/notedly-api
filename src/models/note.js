// THIS IS THE DB SCHEMA FOR NOTE

// Require the mongoose library
const mongoose = require('mongoose');

//Define the notes database schema
const noteSchema = new mongoose.Schema(
	{
		content: {
			type: String,
			required: true
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref:'User',
			required: true
		},
		// add the favouriteCount property
		favouriteCount: {
			type: Number,
			default: 0
		},
		// add the favouritedBy property
		favouritedBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref:'User'
			}
		]
	},
	{
		//Assign createAt and updatedAt fields with a Date type
		timestamps: true
	}
);

//Define the 'Note' model with the schema
const Note = mongoose.model('Note', noteSchema);

//Export the module
module.exports = Note;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
	AuthenticationError,
	ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar');
const mongoose = require('mongoose');

module.exports = {
	signUp: async (parent, { username, email, password }, { models }) => {
		//noralise email
		email = email.trim().toLowerCase();
		// hash password
		const hashed = await bcrypt.hash(password, 10);
		// create the gravatar url
		const avatar = gravatar(email);
		try {
			const user = await models.User.create({
				username,
				email,
				avatar,
				password: hashed
			});

			// create and return the json web token 
			return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		} catch (err) {
			console.log(err);
			// if theres a problem creating account, throw an error
			throw new Error('Error creating account');
		}
	},
	signIn: async (parent, { username, email, password }, { models }) => {
		if (email) {
			//normalise email address
			email = email.trim().toLowerCase();
		}

		const user = await models.User.findOne({
			$or: [{ email }, { username }]
		});
		//if no iser found, throw an error
		if (!user) {
			throw new AuthenticationError('Error signing in');
		}
		// if poasswords dont match, throw an authentication error
		const valid = await bcrypt.compare(password, user.password);
		if(!valid) {
			throw new AuthenticationError('Error signing in');
		}
		// create and return the json web token
		return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		
	},
	deleteNote: async (parent, { id }, { models, user }) => {
		// if not a use, throw an authentication error
		if(!user) {
			throw new AuthenticationError('you must be signed in t delete a note');
		}
		// find note
		const note = await models.Note.findById(id);
		// if the note owner and current user dont match, throw a forbidden error
		if (note && String(note.author) !== user.id) {
			throw new ForbiddenError("you dont have permissions to delete the note");
		}
		try {
			// if everything checks out, remove the note
			await note.remove();
			return true;
		} catch (err) {
			// if there's an errof along the way return false
			return false;
		}
	},
	updateNote: async (parent, { content, id }, { models, user }) => {
		// if not a user, throw an Authentication Error
		if(!user) {
			throw new AuthenticationError('you must be signed in to update a note');
		}
		// find the note
		const note = await models.Note.findById(id);
		// if the note owner and current user dont match, throw a forbidden error
		if (note && String(note.author) !== user.id) {
			throw new ForbiddenError("you dont have permissions to update the note");
		}
		//updat ethe note in teh db and return the updated note
		return await models.Note.findOneAndUpdate(
			{
				_id: id,
			},
			{
				$set: {
					content
				}
			},
			{
				new: true
			}
		);
	},
	// add the users context
	newNote: async (parent, args, { models, user }) => {
		// if there's no user on the context throw an error
		if (!user) {
			throw new AuthenticationError('you must be signed in to create a note');
		}
		return await models.Note.create({
			content: args.content,
			// reference the author's mongo id
			author: mongoose.Types.ObjectId(user.id)
		});
	},
	toggleFavourite: async (parent, { id }, { models, user }) => {
		// if no user context is passed, throw auth error
		if(!user) {
			throw new AuthenticationError();
		}
		//check to see if the user has already favourited the note
		let noteCheck = await models.Note.findById(id);
		const hasUser = noteCheck.favouritedBy.indexOf(user.id);

		//if the user exists in the list
		// pull them from the list and reduce the favouritecountby 1
		if (hasUser >= 0) {
			return await models.Note.findByIdAndUpdate(
				id,
				{
					$pull: {
						favouritedBy: mongoose.Types.ObjectId(user.id)
					},
					$inc: {
						favouriteCount: -1
					}
				},
				{
				// set new to true to return the updated doc
				new: true
				}
			);
		} else {
			// if the user doesnt exist in the list
			// add them to teh list and increment favouritecount by 1
			return await models.Note.findByIdAndUpdate(
				id,
				{
					$push: {
						favouritedBy: mongoose.Types.ObjectId(user.id)
					},
					$inc: {
						favouriteCount: 1
					}
				},
				{
					new: true
				}
			);
		}
	}
}
module.exports = {
	//resolve the author info for a note when requested
	author: async (note, args, { models }) => {
		return await models.User.findById(note.author);
	},
	// Resolved the favouritedBy info for a note when requested
	favouritedBy: async (note, args, { models }) => {
		return await models.User.find({ _id: { $in: note.favouritedBy } });
	}
};
// index.js
// This is the main entry point of our application

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
require('dotenv').config();


// Local module imports
const db = require('./db');
const models = require('./models');
// Construct a schema, using GraphQL schema language - schema definituion to schema.js
const typeDefs = require('./schema');
// Provide resolver functions for our schema fields - resolver code moved to files in resolver folder
const resolvers = require('./resolvers');

// Run the server on a port specified in the .env file or port 4000
const port = process.env.PORT || 4000;
// Store the DBHOST value as a variable
const DB_HOST = process.env.DB_HOST;

// get the user info from a jwt
const getUser = token => {
	if (token) {
		try {
			// return the user information from the token
			return jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			// if there a problem with teh token. throw an error
			throw new Error('Session invalid');
		}
	}
};

let notes = [
	{ id: '1', content: 'This is a note', author: 'Adam Scott' },
	{ id: '2', content: 'This is another note', author: 'Harlow Everly' },
	{ id: '3', content: 'oh hey look, another note!', author: 'Riley Harris'}
];

const app = express();
// add helmet middle ware at top of stack
app.use(helmet());
// cors middleware
app.use(cors());

// connect to db
db.connect(DB_HOST);

// Apollo server setup
const server = new ApolloServer({ 
	typeDefs, 
	resolvers,
	validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
	context: ({ req }) => {
		// get the user token from headers
		const token = req.headers.authorization;
		// try to retrieve a user with the token
		const user = getUser(token);
		// for now lets log user to the console:
		console.log(user);
		// add the db models to the context
		return { models, user };
	}
});

// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => 
	console.log(
		`GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
	)
);


//app.get('/', (req, res) => res.send('Hello Web server!!!'));







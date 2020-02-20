const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const port = process.env.PORT || 4002;

let app = express();
let num = 0;
let users = 0;

app.use(session({
	secret: 'secret apples string',
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 10000}
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: './users.csv',
    header: [
        {id: 'number', title: 'NUMBER'},
				{id: 'time', title: 'TIME'},
				{id: 'first', title: 'FIRST'},
				{id: 'last', title: 'LAST'},
				{id: 'email', title: 'EMAIL'}
    ]
});

app.post('/user', (req, res) => {
	console.log('post request');

	let firstName = req.body.first;
	let lastName = req.body.last;
	let email = req.body.email;

	const records = [
		{
			number: num++,
			time: Date.now(),
			first: firstName,
			last: lastName,
			email: email
		}
	];
 
	csvWriter.writeRecords(records)       // returns a promise
			.then(() => {
					console.log('...Done');
			});
	
	// if(req.session.users){
	// 	req.session.users++;
	// 	res.write(`<h1>users: ${req.session.users}</h1>`);
	// 	res.write(`<h3>expires: ${req.session.cookie.maxAge / 1000}s</h3>`);
	// 	res.end();
	// }
	// else {
	// 	req.session.users = 1;
	// 	res.end('First user added!');
	// }
	// users = req.session.users;

	res.redirect('/lookup.html');
});

app.get('/user', (req, res) => {
	res.send('user page');
});

app.get('/sessionusers', (req, res) => {
	res.send(`Number of users added: ${users}`);
});

app.post('/lookup', (req, res) => {
	let first = req.body.first;
	console.log(first);
	console.log('post request to look up user');

	let results = [];
	let userFound = false;

	fs.createReadStream('./users.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
		console.log(results);
		results.forEach(u => {
			if(u.FIRST === first) {
				console.log('here');
				userFound = true;
			}
		});
		console.log('I am here');
		if(userFound) res.write(`user ${first} found`);
		else res.write('user not found');
		res.end();	
	});	
});

app.get('/', (req, res) => {
	res.send(`
		<h2>Hello world</h2>
		<a href="http://localhost:4000/recipe">Recipe page</a>
	`);
});

app.get('/time', (req, res) => {
	res.send('this is current time');
});

app.get('/recipe', (req, res) => {
	fs.createReadStream('./recipe.txt').pipe(res);
	// fs.readFile('./recipe.txt', (err, data) => {
	// 	if(err) console.log(err);
	// 	else res.send(data.toString());
	// });
});

app.listen(port, () => {
	console.log(`Server is up and listening on port ${port}`);
});
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const fetch = require('node-fetch');
const redis = require('redis');
// require('bootstrap');


// Create Redis Client
let client = redis.createClient();

client.on('connect', function(){
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

app.use(express.static('public'));

//View Engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', function(req, res, next){
    res.render('searchusers');
});

// Search proccessing
app.post('/user/search', function(req, res, next){
    let id = req.body.id;

    client.hgetall(id, function(err, obj){
        if(!obj){
            res.render('searchusers', {
                error: 'User does not exist'
            });
        } else{
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add User Page
app.get('/user/add', function(req, res, next){
    res.render('adduser');
});

// Process Add User Page
app.post('/user/add', function(req, res, next){
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email',email
    ], function(err, reply){
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    }
    );
});

//cache middleware
function cache(req, res, next){
    const {id} = JSON.stringify(req.body.id);

    client.get(id, (err,data) => {
        if(err) throw err;

        if(data !== null){
            res.send(setResponse(id, data));
        }else{
            next();
        }
    })
}




app.listen(port, function(){
    console.log('Server started on port '+port);
});
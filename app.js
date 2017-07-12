var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var session = require('express-session');
var parseurl = require('parseurl');

var app = express();

var users = [
  {'username': 'annie', 'password': 'anime'},
  {'username': 'zach', 'password': 'games'},
  {'username': 'joe', 'password': 'doge'}
];


app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'cake is a lie',
  resave: false,
  saveUninitialized: true
}));

app.use(function(req, res, next){
  var pathname = parseurl(req).pathname;

  if(!req.session.user && pathname != '/login'){
    res.redirect('/login?next=' + pathname);
  }else{
    next();
  }
});

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    views = req.session.views = {};
  }

var pathname = parseurl(req).pathname;

views[pathname] = (views[pathname] || 0) + 1;
next();
});

app.get('/login', function(req, res){

  var context = {
    next: req.query.next
  };
    res.render('login', context);
  // if(req.session.user){
  //   res.redirect('/home');
  // }
});

app.get('/login', function(req, res){
  var context = {
    'username' : req.session.user.username,
    'views' : req.session.views['/']
  };
  res.render('index', context);
});



app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var nextPage = req.body.next;

  var person = users.find(function(user){
    return user.username == username;
  });
  if(person && person.password == password){
    req.session.user = person;
  }else if(req.session.user) {
    delete req.session.user;
  }
  if(req.session.user){
    res.redirect('nextPage');
  }else{
    res.redirect('/login');
  }
});

app.get('/home', function(req, res){
  res.send('hello!');
});

// app.get('/stuff', function(req, res){
//   res.send('something');
// });



app.listen(3000);

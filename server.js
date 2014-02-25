var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var post = require('./routes/post');
var sm = require('sitemap');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/* RESTful API */
app.get('/api/posts', post.getAllPosts);
app.put('/api/posts/:post_id', post.editPost);
app.post('/api/posts', post.addPost);
app.delete('/api/posts/:post_id', post.deletePost);

/* Render page for SEO spider */
var isCrawler = function(req, res, next) {
  if (req.query.hasOwnProperty('_escaped_fragment_')) {
  	var query = req.query._escaped_fragment_;
  	var queryArray = query.split('/');

  	if (queryArray[0] === 'posts') {
	  	if (queryArray.length === 1){
	 			post.renderPostList(req, res);
	  	}else if (queryArray.length === 2) {
	  		var options = { post_id : queryArray[1] };
  			post.renderPostDetail(req, res, options);
	  	}else{
	  		next();
	  	}
	  }else{
  	  next();
  	}
  }else{
    res.render('index');
  }  
};

/* Render page - When user sends request by calling URL directly 
 * i.e. typing URL or refreshing browser
 */
app.get('/', isCrawler, routes.indexSpider);
app.get('/posts/edit/:post_id', routes.index);	// --> no provide contents of edit page for crawler

app.get('/sitemap.xml', function(req, res) {
  var fullURL = req.protocol + "://" + req.get('host');

  var sitemap = sm.createSitemap ({
    hostname: fullURL,
    cacheTime: 600000,
    urls: [
      { url: '',  changefreq: 'daily'},
      { url: '/#!/posts',  changefreq: 'daily'}
    ]
  });

  sitemap.toXML( function (xml) {
      res.header('Content-Type', 'application/xml');
      res.send( xml );
  });
});

app.get('/sitemap.xml', function(req, res) {
  var fullURL = req.protocol + "://" + req.get('host');

  var sitemap = sm.createSitemap ({
    hostname: fullURL,
    cacheTime: 600000,
    urls: [
      { url: '',  changefreq: 'daily'},
      { url: '/posts',  changefreq: 'daily'}
    ]
  });

  sitemap.toXML( function (xml) {
      res.header('Content-Type', 'application/xml');
      res.send( xml );
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

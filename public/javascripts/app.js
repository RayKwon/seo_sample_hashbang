(function() {

var get = Ember.get, set = Ember.set;

Ember.Location.registerImplementation('hashbang', Ember.HashLocation.extend({   

  getURL: function() {
    return get(this, 'location').hash.substr(2);
  },

  setURL: function(path) {
    get(this, 'location').hash = "!"+path;
    set(this, 'lastSetURL', "!"+path);
  },

  onUpdateURL: function(callback) {
    var self = this;
    var guid = Ember.guidFor(this);

    Ember.$(window).bind('hashchange.ember-location-'+guid, function() {
      Ember.run(function() {
        var path = location.hash.substr(2);
        if (get(self, 'lastSetURL') === path) { return; }
        set(self, 'lastSetURL', null);
        callback(location.hash.substr(2));
      });
    });
  },

  formatURL: function(url) {
    return '#!'+url;
  }

  })
);

})();


var App = App || Ember.Application.create();

App.Router.reopen({
  location: 'hashbang'
});

App.Router.map(function(){
  this.resource('posts', function(){
    this.route('detail', { path: '/:post_id' });
    this.route('edit', { path: '/edit/:post_id' });
    this.route('new', { path: '/new'});
  });
});

App.PostsRoute = Ember.Route.extend({
  model: function () {
    return $.getJSON('/api/posts');
  },
  actions: {
    updatePosts: function() {
      var self = this;
      this.model().done(function(posts){
        self.get('controller').set('model', posts);
      });
    }
  }
});

App.PostsController = Ember.ArrayController.extend({
  actions: {
    deletePost: function(post) {
      var self = this;
      $.ajax({
        url: '/api/posts/' + post.id,
        type: 'DELETE'
      }).done(function(){
        self.send('updatePosts');
        self.transitionToRoute('posts');
      });
    }
  }
})

App.PostsDetailRoute = Ember.Route.extend({
  model: function (params) {
    var posts = this.modelFor('posts');
    var post = _.find(posts, function (post) {
      return post.id == params.post_id;
    });
    return post;
  }
});

App.PostsEditRoute = Ember.Route.extend({
  model: function (params) {
    var posts = this.modelFor('posts');
    var post = _.find(posts, function (post) {
      return post.id == params.post_id;
    });
    return post;
  }
});


App.PostsNewController = Ember.Controller.extend({
  actions: {
    addPost: function (file) {
      var self = this,
          data = {
            id: this.get('id'),
            title: this.get('title'),
            author: this.get('author'),
            contents: this.get('contents')
          };

      $.ajax({
        type: 'POST',
        url: '/api/posts',
        data : data
      }).done(function(res){
        self.send('updatePosts');
        self.transitionToRoute('posts');
      });
    }
  }
});

App.PostsEditController = Ember.ObjectController.extend({
  actions: {
    editPost: function (file) {
      var self = this,
          data = {
            id: this.get('id'),
            title: this.get('title'),
            author: this.get('author'),
            contents: this.get('contents')
          };

      $.ajax({
        type: 'PUT',
        url: '/api/posts/' + this.get('id'),
        data : data
      }).done(function(res){
        self.transitionToRoute('posts.detail', data);
      });
    }
  }
});



Ember.Handlebars.helper('markdown', function(value){
  if (value)
    return new Handlebars.SafeString(markdown.toHTML(value));
  return '';
});
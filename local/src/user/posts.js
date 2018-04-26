var obtains = [
  'fs',
  'uuid/v4',
  `${__dirname}/management.js`,
];

obtain(obtains, (fs, uuidv4, users)=> {

  var postStore = './.posts.json';
  var fileStore = './.files.json';

  if (!window.appData.posts) {
    window.appData.posts = [];
    if (fs.existsSync(postStore)) {
      var posts = JSON.parse(fs.readFileSync(postStore));
      window.appData.posts = posts.posts;
    }
  }

  // req = {key, val, number, start}

  exports.request = (req, sup)=> {
    var ret = appData.posts.filter(post=>post[req.key] == req.value);
    //do some checking for authorization
    ret.filter(post=> {
      var author = appData.profiles.find((prof)=>prof.name == post.user.name);
      if (post.public) return true;
      else if (author.friends.find(el=>sup && el == (sup.id + '@' + sup.hub.id))) return true;
      else if (sup && sup.id == author.id) return true;
      else return false;
    });
    return ret.slice(req.start, req.start + req.number);

  };

  exports.handlePeerRequest = (peer)=> {
    var posts = exports.request({ key: { public: true },  number: 10, start: 0 }, peer.user);
    posts.forEach(post=> {
      if (post.img.length > 8192) {
        var data = {};
        for (var key in post) {
          if (post.hasOwnProperty(key) && key != 'img') {
            data[key] = post[key];
          }
        }

        peer.send('posts:view', [data]);
        for (var i = 0; i < Math.ceil(post.img.length / 8192); i++) {
          peer.send('posts:dataurl', {
            id: post.id,
            data: post.img.slice(i * 8192, (i + 1) * 8192),
          });
        }
      } else peer.send('posts:view', [post]);
    });
  };

  exports.edit = (post)=> {
    var old = exports.find('id', post.id);
    if (old) {
      old = post;
    }
  };

  exports.create = (post)=> {
    var newPost = {
      user: post.user,
      title: post.title,
      img: post.img,
      text: post.text,
      id: uuidv4(),
      tags: post.tags,
      public: post.public,
      timestamp: Date.now(),
    };

    if (post.fileId) {
      newPost.fileId = post.fileId;
      newPost.fileSize = post.fileSize;
      window.appData.posts.push(newPost);
      return { await: 'fileTransmit' };
    } else {
      window.appData.posts.push(newPost);
      fs.writeFileSync(postStore, JSON.stringify({ posts: appData.posts }));
      return newPost;
    }
  };

  exports.find = (key, value)=> appData.posts.find(post=>post[key] == value);

  exports.connect = (peer)=> {
    peer.on('posts:edit', (details)=> {
      peer.send('posts:edit', exports.edit(details));
    });

    peer.on('posts:dataurl', (deets)=> {
      var post = exports.find('fileId', deets.fileId);
      if (post) {
        post.img += deets.data;
        if (post.img.length >= post.fileSize) {
          µ('#test').src = post.img;
          fs.writeFileSync(postStore, JSON.stringify({ posts: appData.posts }));
        }
      }
    });

    peer.on('posts:create', (details)=> {
      if (peer.user) {
        details.user = peer.user;
        peer.send('posts:create', exports.create(details));
      } else {
        peer.send('posts:create', { error: 'NOT_LOGGED_IN' });
      }

    });

    peer.on('posts:view', (details)=> {
      console.log('got post view request');
      peer.send('posts:view', exports.request(details));
    });
  };

});

'use strict';

var remote = require('electron').remote;

var process = remote.process;

//remote.getCurrentWindow().closeDevTools();

var obtains = [
  './src/connection.js',
  './src/user/management.js',
  './src/user/profiles.js',
  './src/user/posts.js',
  'µ/components',
  './src/render.js',
  './src/saltHash.js',
  'fs',
  'os',
  'uuid/v4',
];

window.appData = {};

appData.config = {};

var confDir = `${require('os').homedir()}/.ConduitConfig.js`;

if (require('fs').existsSync(confDir)) {
  appData.config = JSON.parse(require('fs').readFileSync(confDir));
}

var config = appData.config;

muse.useSSL = true;

obtain(obtains, (cnxn, users, profiles, posts, components, { render }, saltHash, fs, os, uuidv4)=> {

  exports.app = {};

  if (!config.key) {
    config.key = uuidv4();
    config.id = uuidv4();
    console.log(appData.config.id);
    config.cnxnURL = '127.0.0.1';
    var rand = crypto.getRandomValues(new Uint16Array(3));

    var getWord = (list, which)=> {
      var word = list[rand[which] % list.length];
      return word.charAt(0).toUpperCase() + word.slice(1);
    };

    var { nouns, adjs } = require('./words.js');

    config.createCode = getWord(adjs, 0) + getWord(adjs, 1) + getWord(nouns, 2);
    console.log(config.createCode);
  }

  exports.app.start = ()=> {
    //render([{ div: { id: 'test' }, _: [{ div: { id: 'test1' }, _: 'test1' }, { div: { id: 'test2' }, _: 'test2' }] }], µ('#tester'));
    //[{div: {id: 'test'}, _: {[{div: {id: 'test1'}, _: 'string'}, {div: {id: 'test2'}, _: 'string'}]}}]

    cnxn.setup(config);
    users.connect(cnxn);

    µ('#name').value = config.name;
    µ('#key').value = config.key;
    µ('#newUser').value = config.createCode;
    µ('#cnxnURL').value = config.cnxnURL || '127.0.0.1';;

    // cnxn.peers.onPeerConnect = (peer)=> {
    //   peer.addListener('message', (data)=> {
    //     cnxn.peers.peers.filter(per=>per.id != peer.id).forEach(per=> {
    //       send('message', data);
    //     });
    //   });
    //
    //   profiles.connect(peer);
    //
    //   peer.send({ message: 'test call' });
    //
    // };

    cnxn.onNewConnection = (peer)=> {
      console.log('Connected to peer');
      peer.onconnect = ()=> {
        if (peer.query && peer.query.user)console.log('pass user posts');
        else if (peer.query) {
          //setTimeout(()=> {
          posts.handlePeerRequest(peer);
          //}, 500);
        }

        peer.query = null;

        peer.onclose = ()=> {
          console.log('Peer disconnected');
        };

        profiles.connect(peer);
        posts.connect(peer);
      };
    };

    µ('#saveCfg').onclick = (e)=> {
      config.name = µ('#name').value;
      config.key = µ('#key').value;
      config.cnxnURL = µ('#cnxnURL').value;
      config.createCode = µ('#newUser').value;
      fs.writeFileSync(confDir, JSON.stringify(config));
    };

    console.log('started');

    document.onkeypress = (e)=> {
      //if (e.key == ' ') console.log('Space pressed'), hardware.digitalWrite(13, 1);
    };

    document.onkeyup = (e)=> {
      if (e.which == 27) {
        var electron = require('electron');
        process.kill(process.pid, 'SIGINT');
      } else if (e.which == 73 && e.getModifierState('Control') &&  e.getModifierState('Shift')) {
        remote.getCurrentWindow().toggleDevTools();
      }
    };

    process.on('SIGINT', ()=> {
      process.nextTick(function () { process.exit(0); });
    });
  };

  provide(exports);
});

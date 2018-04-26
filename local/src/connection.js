var obtains = [
  'µ/dataChannel.js',
  'µ/socket.js',
  'uuid/v4',
];

obtain(obtains, (peers, socket, uuidv4)=> {
  exports.setup = (config)=> {
    exports.ws = socket.get(config.cnxnURL);
    peers.init(exports.ws, { uuid: config.id, name: config.name });
    exports.peers = peers;

    exports.onNewConnection = (peer)=> {

    };

    var ws = exports.ws;

    ws.onconnect = ()=> {
      console.log('connected');
      //ws.setId(config.name);
      ws.send('cnxn:setName', {
        name: config.name,
        id: config.id,
        key: config.key,
      });

      ws.on('cnxn:setName', (approved)=> {
        if (!approved) {
          console.log('name taken');
          config.name = '';
          µ('#name').value = '';
        } else console.log('registered as ' + approved.name + ' with ' + approved.uuid);

      });

      ws.on('cnxn:request', (req)=> {
        if (!muse.peers.find(peer=>peer.id == req.fromId)) {
          console.log('got connection request');
          var open = false;

          var peer = peers.getPeer({ remoteId: req.fromId });
          peer.user = req.user;
          peer.query = req.query;

          peer.connect();

          peer.on;
          exports.onNewConnection(peer);
        }

      });

    };

    ws.connect();
  };

  provide(exports);
});

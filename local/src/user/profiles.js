var obtains = [
  'fs',
  'uuid/v4',
  `${__dirname}/management.js`,
];

obtain(obtains, (fs, uuidv4, users)=> {

  var profileStore = './.profiles.json';

  if (!window.appData.profiles) {
    window.appData.profiles = [];
    if (fs.existsSync(profileStore)) {
      console.log('getting profiles');
      window.appData.profiles = JSON.parse(fs.readFileSync(profileStore)).hubs;
      console.log(appData.profiles);
    }
  }

  exports.request = (which, sup)=> {
    var ret = {};
    var excl = ['protected', 'private'];
    //keys.remove = key=>keys = keys.filter(item=>item != key);
    var prof = exports.find('name', which.name);
    var isFriend = !!prof.friends.find(fr=>fr.name == sup.name && fr.hub.id == sup.hub.id);
    if (sup.id && which.id == sup.id) excl = [];
    else if (!sup.id || !isFriend) excl.concat(prof.protected);

    for (var key in prof) if (prof.hasOwnProperty(key)) {
      if (!excl.find(ky=>ky == key)) ret[key] = prof[key];
    }

    return ret;
  };

  exports.create = (user)=> {
    var newProfile = {
      name: user.name,
      id: user.id,
      hub: appData.config.name,
      hubId: appData.config.id,
      longName: 'LongName',
      dob: new Date('01/01/87'),
      icon: 'https://avatars1.githubusercontent.com/u/827498?s=460&v=4',
      about: 'I am computer. Transmission oops.',
      friends: [],
      protected: ['friends'],
      private: [],
    };

    console.log(newProfile);
    window.appData.profiles.push(newProfile);
    fs.writeFileSync(profileStore, JSON.stringify({ hubs: appData.profiles }));
  };

  exports.find = (key, value)=> appData.profiles.find(prof=>prof[key] == value);

  exports.connect = (peer)=> {
    console.log('registering profile callbacks');
    peer.addListener('profile:edit', (details)=> {
      peer.send('profile:edit', editProfile(details));
    });

    peer.addListener('profile:view', (details)=> {
      console.log('got profile view request');
      if (!peer.user) users.getVerifiedUser(peer.id).then((user)=> {
        peer.user = user;
        if (user) peer.send('profile:view', exports.request(details.user, peer.user));
        else peer.send('profile:view', { error: 'NOT_LOGGED_IN' });
      });
      else peer.send('profile:view', exports.request(details.user, peer.user));
    });
  };

});

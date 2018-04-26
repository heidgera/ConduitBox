var obtains = [
  './src/saltHash.js',
  './src/user/profiles.js',
  'fs',
  'uuid/v4',
];

obtain(obtains, (saltHash, profiles, fs, uuidv4)=> {

  var userList = './.userList.json';

  var createUser = (deets)=> {
    var ret = { success: false };
    if (deets.key == saltHash.simpleHash(appData.config.createCode)) {
      if (!appData.users.find(user=>user.name == deets.user)) {
        var newHash = saltHash.generate(deets.pass);
        ret.usr = {
          name: deets.user,
          id: uuidv4(),
          hash: newHash.hash,
          salt: newHash.salt,
        };
        ret.success = true;
        appData.users.push(ret.usr);
        profiles.create(ret.usr);
        fs.writeFileSync(userList, JSON.stringify({ users: appData.users }));
      } else {
        ret.error = 'NAME_TAKEN';
      }
    }

    return ret;
  };

  var authUser = (deets)=> {
    console.log('authing');
    var locl = appData.users.find(user=>user.name == deets.user);
    if (!locl) return ({ id: '', verified: false });
    return { id: locl.id, verified: saltHash.check(deets.pass, locl.salt, locl.hash) };
  };

  if (!window.appData.users) {
    window.appData.users = [];
    if (fs.existsSync(userList)) {
      window.appData.users = JSON.parse(fs.readFileSync(userList)).users;
    } else {
      console.log(createUser({
        user: 'admin',
        key: saltHash.simpleHash(appData.config.createCode),
        pass: saltHash.simpleHash('admin'),
      }));
      //appData.users = [{ name: 'admin', id: uuidv4(), hash: '775dfe537685d44f247b961557f4a56e0fe4ac0d09392b21c9e62a4934cd5506b3279850dc9084e17e16cdf4de2c0a9c4f2d9c3214421ab0b8adfdfa7ea35c67', salt: '66785d6443364fdf' }];
    }
  }

  exports.connect = (cnxn)=> {
    var ws = cnxn.ws;
    ws.addListener('user:create', (details)=> {
      ws.send('user:create', createUser(details));
    });

    ws.addListener('user:verify', (details)=> {
      ws.send('user:verify', authUser(details));
    });

    exports.getVerifiedUser = (cnxnId)=> {
      return new Promise((res, rej)=> {
        console.log('requesting confirmation');
        ws.on('user:confirm', (details)=> {
          console.log(details);
          if (details) res(details);
          else rej(details);
        });
        ws.send('user:confirm', cnxnId);
      });
    };
  };

});

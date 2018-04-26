'use strict';

obtain(['crypto'], (crypto)=> {
  /**
   * generates random string of characters i.e salt
   * @function
   * @param {number} length - Length of the random string.
   */
  var genRandomString = function (length) {
      return crypto.randomBytes(Math.ceil(length / 2))
              .toString('hex') /** convert to hexadecimal format */
              .slice(0, length);   /** return required number of characters */
    };

  /**
  * hash password with sha512.
  * @function
  * @param {string} password - List of required fields.
  * @param {string} salt - Data to be validated.
  */
  exports.simpleHash = pass=>crypto.createHmac('sha512', pass).digest('hex');

  exports.generate = function (password) {
    var salt = genRandomString(16);
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        hash: value,
      };
  };

  exports.check = (password, salt, hash)=> {
    return hash == crypto.createHmac('sha512', salt).update(password).digest('hex');
  };

});

const electronremote = window.require("electron").remote;
const crypto = electronremote.require('crypto');

var password =  require('../data/encryptiondata.json').pass;

var algorithm = 'aes-256-ctr';

export function Encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
export function Decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
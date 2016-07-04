import Data from '../Data';
import call from '../Call';
import User from './User';
import { hashPassword } from '../../lib/utils';


module.exports = {
  createUser(options, callback = ()=>{}) {
    if (options.username) options.username = options.username;
    if (options.email) options.email = options.email;

    // Replace password with the hashed password.
    options.password = hashPassword(options.password);

    new Promise((resolve, reject) => {
      User._startLoggingIn();
      call("createUser", options, (err, result)=>{
        User._endLoggingIn();

        User._handleLoginCallback(err, result);

        callback(err, result);
        err ? reject(err) : resolve(result);
      });
    });
  },
  changePassword(oldPassword, newPassword, callback = ()=>{}) {

    //TODO check Meteor.user() to prevent if not logged

    if(typeof newPassword != 'string' || !newPassword) {
      return callback("Password may not be empty");
    }

    return new Promise((resolve, reject) => {
      call("changePassword",
        oldPassword ? hashPassword(oldPassword) : null,
        hashPassword(newPassword),
        (err, res) => {
          callback(err);
          err ? reject(err) : resolve(res);
      });
    });
  },
  forgotPassword(options, callback = ()=>{}) {
    if (!options.email) {
      return callback("Must pass options.email");
    }

    return new Promise((resolve, reject) => {
      call("forgotPassword", options, err => {
        callback(err);
        err ? reject(err) : resolve(undefined);
      });
    });
  },
  resetPassword(token, newPassword, callback = ()=>{}) {
    if (!newPassword) {
      return callback("Must pass a new password");
    }

    return new Promise((resolve, reject) => {
      call("resetPassword", token, hashPassword(newPassword), (err, result) => {
        if (!err) {
          User._loginWithToken(result.token);
        }

        callback(err);
        err ? reject(err) : resolve(result);
      });
    });
  },
  onLogin(cb) {
    Data.on('onLogin', cb);
  },
  onLoginFailure(cb) {
    Data.on('onLoginFailure', cb);
  }
}

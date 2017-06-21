/**
 * User configuration module.
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(function (require) {
  'use strict';

  var angular = require('angular'),
      name = 'biobank.users',
      module;

  module = angular.module(name, [ 'biobank.common' ]);

  module
    .config(require('./states'))
    .component('forgotPassword', require('./components/forgotPassword/forgotPasswordComponent'))
    .component('registerUser',   require('./components/registerUser/registerUserComponent'))
    .component('userProfile',    require('./components/userProfile/userProfileComponent'))

    .directive('login',         require('./directives/login/loginDirective'))
    .directive('passwordCheck', require('./directives/passwordCheck/passwordCheckDirective'))
    .directive('passwordSent',  require('./directives/passwordSent/passwordSentDirective'))
    .directive('passwordCheck', require('./directives/passwordCheck/passwordCheckDirective'))

    .service('usersService',   require('./usersService'))
    .service('userStateLabel', require('./userStateLabelService'));

  return {
    name: name,
    module: module
  };
});

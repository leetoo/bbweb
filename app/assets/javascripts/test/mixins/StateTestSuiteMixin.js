/*
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2018 Canadian BioSample Repository (CBSR)
 */

import { TestSuiteMixin } from 'test/mixins/TestSuiteMixin';

/**
 * This is a mixin that can be added UserContext object of a Jasmine *UI Router* state definition test suite.
 *
 * @exports test.mixins.StateTestSuiteMixin
 */
let StateTestSuiteMixin = {

  /**
   * Used to inject AngularJS dependencies into the test suite.
   *
   * Also injects dependencies required by this mixin.
   *
   * @param {...string} dependencies - the AngularJS dependencies to inject.
   *
   * @return {undefined}
   */
  injectDependencies: function (...dependencies) {
    const allDependencies = dependencies.concat([
      '$q',
      '$cookies',
      '$location',
      '$rootScope',
      'userService',
      'Factory'])
    TestSuiteMixin.injectDependencies.call(this, ...allDependencies);
  },

  /**
   * Configures the test app to pretend the user has logged in.
   *
   * @modifies {users.services.userService#requestCurrentUser} to be a Jasmine spy that returns a dummy
   * {@link domain.users.User User}.
   */
  initAuthentication: function  () {
    // the following line bypasses initialization in userService
    //this.$cookies.remove('XSRF-TOKEN');
    this.userService.init = jasmine.createSpy().and.returnValue(null);

    const user = this.Factory.user();
    this.userService.requestCurrentUser = jasmine.createSpy().and.returnValue(this.$q.when(user));
  },

  /**
   * Changes state corresponding to the URL passed in.
   *
   * @param {string} url - the URL to change state to.
   */
  gotoUrl: function (url) {
    this.$location.url(url);
    this.$rootScope.$digest();
  }

};

StateTestSuiteMixin = Object.assign({}, TestSuiteMixin, StateTestSuiteMixin);

export { StateTestSuiteMixin };
export default () => {};

/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import _ from 'lodash';

describe('UserState', function() {

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function(UserState) {
      this.UserState = UserState;
    });
  });

  it('should have values', function () {
    expect(_.keys(this.UserState)).not.toBeEmptyArray();
  });

});

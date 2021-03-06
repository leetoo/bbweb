/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2018 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import { ComponentTestSuiteMixin } from 'test/mixins/ComponentTestSuiteMixin';
import ngModule from '../../index'

describe('Component: studyAdd', function() {

  beforeEach(() => {
    angular.mock.module(ngModule, 'biobank.test');
    angular.mock.inject(function() {
      Object.assign(this, ComponentTestSuiteMixin);

      this.injectDependencies('$rootScope',
                              '$compile',
                              'Study',
                              'Factory');

      this.study = new this.Study();
      this.titleContains = 'Add';
      this.returnState = 'home.admin.studies';

      this.createController = () => {
        this.createControllerInternal(
          '<study-add study="vm.study"></study-add>',
          { study: this.study },
          'studyAdd');
      };
    });
  });

  it('should contain valid settings to update a study', function() {
    this.createController();
    expect(this.controller.breadcrumbs).toBeNonEmptyArray();
  });

  it('should return to valid state on cancel', function() {
    var $state = this.$injector.get('$state');

    spyOn($state, 'go').and.callFake(function () {} );
    this.createController();
    this.controller.cancel();
    this.scope.$digest();
    expect($state.go).toHaveBeenCalledWith(this.returnState);
  });

  it('should return to valid state on invalid submit', function() {
    var $q                  = this.$injector.get('$q'),
        domainNotificationService = this.$injector.get('domainNotificationService');

    spyOn(domainNotificationService, 'updateErrorModal').and.callFake(function () {});
    spyOn(this.Study.prototype, 'add').and.callFake(function () {
      var deferred = $q.defer();
      deferred.reject('err');
      return deferred.promise;
    });

    this.createController();
    this.controller.submit(this.study);
    this.scope.$digest();
    expect(domainNotificationService.updateErrorModal)
      .toHaveBeenCalledWith('err', 'study');
  });

  it('should return to valid state on submit', function() {
    var $q     = this.$injector.get('$q'),
        $state = this.$injector.get('$state');

    spyOn($state, 'go').and.callFake(function () {} );
    spyOn(this.Study.prototype, 'add').and.callFake(function () {
      return $q.when('test');
    });

    this.createController();
    this.controller.submit(this.study);
    this.scope.$digest();
    expect($state.go).toHaveBeenCalledWith(this.returnState, {}, { reload: true });
  });

});

/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import _ from 'lodash';

describe('ceventTypesAddAndSelectComponent', function() {

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function(ComponentTestSuiteMixin) {
      var jsonStudy, jsonCet;

      _.extend(this, ComponentTestSuiteMixin.prototype);

      this.injectDependencies('$rootScope',
                              '$compile',
                              '$q',
                              '$state',
                              'Study',
                              'CollectionEventType',
                              'factory');

      jsonStudy = this.factory.study();
      jsonCet   = this.factory.collectionEventType(jsonStudy);

      this.study = new this.Study(jsonStudy);
      this.collectionEventType = new this.CollectionEventType(jsonCet);

      spyOn(this.CollectionEventType, 'list').and.returnValue(this.$q.when([ this.collectionEventType ]));
      spyOn(this.$state, 'go').and.callFake(function () {});

      this.createController = (study, collectionEventType) => {
        var collectionEventTypes;
        study = study || this.study;
        collectionEventType = collectionEventType || this.collectionEventType;

        if (_.isUndefined(collectionEventType)) {
          collectionEventTypes = [];
        } else {
          collectionEventTypes = [ collectionEventType ];
        }

        this.CollectionEventType.list =
          jasmine.createSpy().and.returnValue(this.$q.when(this.factory.pagedResult(collectionEventTypes)));

        ComponentTestSuiteMixin.prototype.createController.call(
          this,
          '<cevent-types-add-and-select study="vm.study" collection-event-types="vm.collectionEventTypes">' +
            '</cevent-types-add-and-select>',
          {
            study:                study,
            collectionEventTypes: collectionEventType
          },
          'ceventTypesAddAndSelect');
      };
    });
  });

  it('has valid scope', function() {
    this.collectionEventType = undefined;
    this.createController(this.study, undefined);
    expect(this.controller.collectionEventTypes).toBeArrayOfSize(0);
  });

  it('function add switches to correct state', function() {
    this.createController();
    this.controller.add();
    this.scope.$digest();
    expect(this.$state.go).toHaveBeenCalledWith('home.admin.studies.study.collection.ceventTypeAdd');
  });

  it('function select switches to correct state', function() {
    this.createController();
    this.controller.select(this.collectionEventType);
    this.scope.$digest();
    expect(this.$state.go).toHaveBeenCalledWith('home.admin.studies.study.collection.ceventType',
                                                { ceventTypeId: this.collectionEventType.id });
  });

  it('function recurring returns a valid result', function() {
    this.createController();
    this.collectionEventType.recurring = false;
    expect(this.controller.getRecurringLabel(this.collectionEventType)).toBe('NonRec');
    this.collectionEventType.recurring = true;
    expect(this.controller.getRecurringLabel(this.collectionEventType)).toBe('Rec');
  });

  it('function pageChanged switches to correct state', function() {
    this.createController();
    this.controller.pageChanged();
    this.scope.$digest();
    expect(this.$state.go).toHaveBeenCalledWith('home.admin.studies.study.collection');
  });

  describe('for updating name filter', function() {

    it('filter is updated when user enters a value', function() {
      var name = this.factory.stringNext();
      this.createController();

      this.CollectionEventType.list =
        jasmine.createSpy().and.returnValue(this.$q.when(this.factory.pagedResult([])));

      this.controller.nameFilter = name;
      this.controller.nameFilterUpdated();
      this.scope.$digest();

      expect(this.controller.pagerOptions.filter).toEqual('name:like:' + name);
      expect(this.controller.pagerOptions.page).toEqual(1);
      expect(this.controller.displayState).toBe(this.controller.displayStates.NO_RESULTS);
    });

    it('filter is updated when user clears the value', function() {
      this.createController();
      this.controller.nameFilter = '';
      this.controller.nameFilterUpdated();
      this.scope.$digest();

      expect(this.controller.pagerOptions.filter).toBeEmptyString();
      expect(this.controller.pagerOptions.page).toEqual(1);
    });

  });

});

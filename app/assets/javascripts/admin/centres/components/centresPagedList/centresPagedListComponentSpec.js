/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2017 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import _ from 'lodash';
import sharedBehaviour from '../../../../test/EntityPagedListSharedBehaviourSpec';

describe('centresPagedListComponent', function() {

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function(ComponentTestSuiteMixin) {
      _.extend(this, ComponentTestSuiteMixin.prototype);

      this.injectDependencies('$q',
                              '$rootScope',
                              '$compile',
                              'Centre',
                              'CentreCounts',
                              'CentreState',
                              'NameFilter',
                              'StateFilter',
                              '$state',
                              'factory');

      this.createController = () => {
        ComponentTestSuiteMixin.prototype.createController.call(
          this,
          '<centres-paged-list></centres-paged-list',
          undefined,
          'centresPagedList');
      };

      this.createCountsSpy = (disabled, enabled) => {
        var counts = {
          total:    disabled + enabled,
          disabled: disabled,
          enabled:  enabled
        };

        spyOn(this.CentreCounts, 'get').and.returnValue(this.$q.when(counts));
      };

      this.createEntity = () => {
        var entity = new this.Centre(this.factory.centre());
        return entity;
      };

      this.createPagedResultsSpy = (centres) => {
        var reply = this.factory.pagedResult(centres);
        spyOn(this.Centre, 'list').and.returnValue(this.$q.when(reply));
      };

    });
  });

  it('scope is valid on startup', function() {
    this.createCountsSpy(2, 5);
    this.createPagedResultsSpy([]);
    this.createController();

    expect(this.controller.limit).toBeDefined();
    expect(this.controller.filters[this.StateFilter.name].allChoices()).toBeArrayOfObjects();
    expect(this.controller.filters[this.StateFilter.name].allChoices()).toBeNonEmptyArray();
    expect(this.controller.getItems).toBeFunction();
    expect(this.controller.getItemIcon).toBeFunction();
  });

  it('when centre counts fails', function() {
    this.CentreCounts.get = jasmine.createSpy()
      .and.returnValue(this.$q.reject({ status: 400, message: 'testing'}));
    this.createController();
    expect(this.controller.counts).toEqual({});
  });

  describe('centres', function () {

    var context = {};

    beforeEach(inject(function () {
      var self = this;

      context.createController = function (centresCount) {
        var centres;
        centresCount = centresCount || 0;
        centres = _.map(_.range(centresCount), self.createEntity.bind(self));
        self.createCountsSpy(2, 5);
        self.createPagedResultsSpy(centres);
        self.createController();
      };

      context.getEntitiesLastCallArgs = function () {
        return self.Centre.list.calls.mostRecent().args;
      };

      context.stateFilterValue = this.CentreState.DISABLED;
      context.sortFields = ['Name', 'State'];
      context.defaultSortFiled = 'name';
    }));

    sharedBehaviour(context);

  });

  describe('getItemIcon', function() {

    beforeEach(function() {
      this.createCountsSpy(2, 5);
      this.createPagedResultsSpy([]);
      this.createController();
    });

    it('getItemIcon returns a valid icon', function() {
      var self = this,
          statesInfo = [
            { state: this.CentreState.DISABLED, icon: 'glyphicon-cog' },
            { state: this.CentreState.ENABLED,  icon: 'glyphicon-ok-circle' }
          ];

      statesInfo.forEach(function (info) {
        var centre = new self.Centre(self.factory.centre({ state: info.state }));
        expect(self.controller.getItemIcon(centre)).toEqual(info.icon);
      });
    });

    it('getItemIcon throws an error for and invalid state', function() {
      var self = this,
          centre = new this.Centre(this.factory.centre({ state: this.factory.stringNext() }));

      expect(function () {
        self.controller.getItemIcon(centre);
      }).toThrowError(/invalid centre state/);
    });

  });

});

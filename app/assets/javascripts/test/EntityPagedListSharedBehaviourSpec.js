/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2017 Canadian BioSample Repository (CBSR)
 */
/* global inject */

import _ from 'lodash';

export default function sharedBehaviour(context) {

  describe('EntityPagedListSharedBehaviour', function() {

    beforeEach(inject(function(testUtils) {
      testUtils.addCustomMatchers();
    }));

    it('has valid scope', function() {
      context.createController();

      expect(this.controller.sortFieldData).toBeArrayOfSize(context.sortFieldIds.length);
      expect(_.map(this.controller.sortFieldData, 'id')).toContainAll(context.sortFieldIds);
      expect(this.controller.selectedState).toBe('all');
      expect(this.controller.pagerOptions.limit).toBe(5);
      expect(this.controller.pagerOptions.sort).toBe(context.defaultSortFiled);

      expect(this.controller.pageChanged).toBeFunction();
      expect(this.controller.sortFieldSelected).toBeFunction();
      expect(this.controller.filtersCleared).toBeFunction();
    });

    describe('for filters', function() {

      it('updates items when name filter is updated', function() {
        var nameFilterValue = 'test',
            spyArgs;

        context.createController(0);

        this.controller.updateSearchFilter('nameFilter')(nameFilterValue);
        this.scope.$digest();

        spyArgs = context.getEntitiesLastCallArgs()[0];
        expect(spyArgs).toBeObject();
        expect(spyArgs.filter).toEqual('name:like:' + nameFilterValue);
      });

      it('updates items when name state filter is updated', function() {
        var spyArgs;

        context.createController(0);

        this.controller.updateSearchFilter('stateFilter')(context.stateFilterValue);
        this.scope.$digest();

        spyArgs = context.getEntitiesLastCallArgs();
        expect(spyArgs).toBeArray();
        expect(spyArgs[0]).toBeObject();
        expect(spyArgs[0].filter).toEqual('state::' + context.stateFilterValue);
      });

      it('an exception is thrown if a filter is not defined', function() {
        var self = this;
        context.createController(0);
        expect(function () {
          self.controller.updateSearchFilter(self.factory.stringNext());
        }).toThrowError(/filter never assigned/);
      });

    });

    it('updates items when name page number is changed', function() {
      var page = 2,
          spyArgs;

      context.createController(0);

      this.controller.pagerOptions.page = page;
      this.controller.pageChanged();
      this.scope.$digest();

      spyArgs = context.getEntitiesLastCallArgs()[0];
      expect(spyArgs).toBeObject();
      expect(spyArgs.page).toEqual(page);
    });

    it('updates items when sort field is changed', function() {
      var spyArgs;

      context.createController(0);

      context.sortFieldIds.forEach((fieldId) => {
        this.controller.sortFieldSelected(fieldId);
        this.scope.$digest();

        spyArgs = context.getEntitiesLastCallArgs();
        expect(spyArgs).toBeArray();
        expect(spyArgs[0]).toBeObject();
        expect(spyArgs[0].sort).toEqual(fieldId);
      });
    });

    it('has valid display state when there are no entities for criteria', function() {
      context.createController(0);

      this.controller.updateSearchFilter('stateFilter')(context.stateFilterValue);
      this.scope.$digest();

      expect(this.controller.displayState).toBe(1); // NO_RESULTS
    });

    it('has valid display state when there are entities for criteria', function() {
      context.createController(1);
      this.controller.updateSearchFilter('stateFilter')(context.stateFilterValue);
      this.scope.$digest();
      expect(this.controller.displayState).toBe(2); // NO_RESULTS
    });

    xit('has valid display state when there are no entities', function() {
      context.createController(0);
      expect(this.controller.displayState).toBe(0); // NO_ENTITIES
    });

    it('filters are cleared', function() {
      context.createController(1);
      this.controller.nameFilter = this.factory.stringNext();
      this.controller.selectedState = this.factory.stringNext();
      this.controller.filtersCleared();
      this.scope.$digest();
      expect(this.controller.filters.nameFilter.getValue()).toBeEmptyString();
      expect(this.controller.filters.stateFilter.getValue()).toBeEmptyString();
    });

  });
}
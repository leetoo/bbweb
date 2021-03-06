/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2018 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import { ComponentTestSuiteMixin } from 'test/mixins/ComponentTestSuiteMixin';
import _ from 'lodash';
import entityUpdateSharedBehaviour from 'test/behaviours/entityUpdateSharedBehaviour';
import ngModule from '../../index'

describe('Component: studySummary', function() {

  beforeEach(() => {
    angular.mock.module(ngModule, 'biobank.test');
    angular.mock.inject(function() {
      var specimenDefinition, ceventType;

      Object.assign(this, ComponentTestSuiteMixin);

      this.injectDependencies('$q',
                              '$rootScope',
                              '$compile',
                              '$state',
                              'Study',
                              'CollectionEventType',
                              'CollectionSpecimenDefinition',
                              'modalService',
                              'notificationsService',
                              'Factory');

      specimenDefinition = this.Factory.collectionSpecimenDefinition();
      this.study = this.Study.create(this.Factory.study());
      ceventType = this.CollectionEventType.create(
        this.Factory.collectionEventType({ specimenDefinitions: [ specimenDefinition ]}));

      spyOn(this.CollectionEventType, 'list').and.returnValue(this.$q.when([ ceventType ]));
      spyOn(this.modalService, 'showModal').and.returnValue(this.$q.when(true));

      this.study = new this.Study(this.Factory.study());

      this.createScope = () => {
        var scope = ComponentTestSuiteMixin.createScope.call(this, { study: this.study });
        this.eventRxFunc = jasmine.createSpy().and.returnValue(null);
        scope.$on('tabbed-page-update', this.eventRxFunc);
        return scope;
      };

      this.createController = (enableAllowed) => {
        if (_.isUndefined(enableAllowed)) {
          enableAllowed = true;
        }
        this.Study.prototype.isEnableAllowed =
          jasmine.createSpy().and.returnValue(this.$q.when(enableAllowed));

        this.createControllerInternal(
          '<study-summary study="vm.study"></study-summary>',
          { study: this.study },
          'studySummary');
      };
    });
  });

  it('initialization is valid', function() {
    this.createController();
    expect(this.controller.study).toBe(this.study);
    expect(this.controller.descriptionToggleLength).toBeDefined();
    expect(this.controller.isEnableAllowed).toBeTrue();
    expect(this.eventRxFunc).toHaveBeenCalled();
  });

  it('should have valid settings when study has no collection event types', function() {
    this.createController(false);
    expect(this.controller.isEnableAllowed).toBeFalse();
  });

  describe('updates to name', function () {

    var context = {};

    beforeEach(function () {
      context.entity             = this.Study;
      context.createController   = this.createController.bind(this);
      context.updateFuncName     = 'updateName';
      context.controllerFuncName = 'editName';
      context.modalInputFuncName = 'text';
    });

    entityUpdateSharedBehaviour(context);

  });

  describe('updates to description', function () {
    var context = {};

    beforeEach(function () {
      context.entity             = this.Study;
      context.createController   = this.createController.bind(this);
      context.updateFuncName     = 'updateDescription';
      context.controllerFuncName = 'editDescription';
      context.modalInputFuncName = 'textArea';
    });

    entityUpdateSharedBehaviour(context);

  });

  describe('enabling a study', function() {
    var context = {};

    beforeEach(function () {
      context.state = 'enable';
    });

    sharedStudyStateBehaviour(context);
  });

  describe('disabling a study', function() {
    var context = {};

    beforeEach(function () {
      context.state = 'disable';
    });

    sharedStudyStateBehaviour(context);
  });

  describe('retiring a study', function() {
    var context = {};

    beforeEach(function () {
      context.state = 'retire';
    });

    sharedStudyStateBehaviour(context);
  });

  describe('unretiring a study', function() {
    var context = {};

    beforeEach(function () {
      context.state = 'unretire';
    });

    sharedStudyStateBehaviour(context);
  });


  function sharedStudyStateBehaviour(context) {

    describe('(shared) study state', function () {

      it('change state', function () {
        spyOn(this.modalService, 'modalOkCancel').and.returnValue(this.$q.when('ok'));
        spyOn(this.Study, 'get').and.returnValue(this.$q.when(this.study));
        spyOn(this.Study.prototype, context.state).and.returnValue(this.$q.when(this.study));

        this.createController();
        this.controller.changeState(context.state);
        this.scope.$digest();
        expect(this.Study.prototype[context.state]).toHaveBeenCalled();
      });

    });
  }

  it('should throw error for when trying to change to an invalid state', function () {
    var self = this,
        badState = 'xxx';

    this.createController();
    expect(function () {
      self.controller.changeState(badState);
    }).toThrow(new Error('invalid state: ' + badState));
  });

});

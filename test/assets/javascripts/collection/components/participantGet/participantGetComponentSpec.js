/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
define(function (require) {
  'use strict';

  var mocks = require('angularMocks'),
      _     = require('lodash');

  describe('participantGetDirective', function() {

    function SuiteMixinFactory(ComponentTestSuiteMixin) {

      function SuiteMixin() {
      }

      SuiteMixin.prototype = Object.create(ComponentTestSuiteMixin.prototype);
      SuiteMixin.prototype.constructor = SuiteMixin;

      SuiteMixin.prototype.createController = function (study) {
        study = study || this.study;

        ComponentTestSuiteMixin.prototype.createController.call(
          this,
          '<participant-get study="vm.study"></participant-get>',
          { study: study },
          'participantGet');
      };

      SuiteMixin.prototype.createStudies = function (numStudies) {
        var self = this;
        return _.map(_.range(numStudies), function () {
          return self.Study.create(self.factory.study());
        });
      };

      SuiteMixin.prototype.createGetStudiesFn = function (studies) {
        var self = this;
        return function (pagerOptions) {
          return self.$q.when(_.extend(self.factory.pagedResult(studies, pagerOptions),
                                       { items: studies.slice(0, pagerOptions.limit) }));
        };
      };

      return SuiteMixin;
    }

    beforeEach(mocks.module('biobankApp', 'biobank.test'));

    beforeEach(inject(function(ComponentTestSuiteMixin) {
      _.extend(this, new SuiteMixinFactory(ComponentTestSuiteMixin).prototype);

      this.injectDependencies('$q',
                              '$log',
                              '$rootScope',
                              '$compile',
                              '$state',
                              'modalService',
                              'Study',
                              'Participant',
                              'factory');
      this.putHtmlTemplates(
        '/assets/javascripts/collection/components/participantGet/participantGet.html',
        '/assets/javascripts/common/services/modalService/modal.html',
        '/assets/javascripts/common/services/modalService/modalOk.html',
        '/assets/javascripts/common/components/breadcrumbs/breadcrumbs.html');

      this.jsonParticipant = this.factory.participant();
      this.jsonStudy       = this.factory.defaultStudy();
      this.participant     = new this.Participant(this.jsonParticipant);
      this.study           = new this.Study(this.jsonStudy);
    }));

    it('has valid scope', function() {
      this.createController();
      expect(this.controller).toBeDefined();
      expect(this.controller.study).toBe(this.study);
      expect(this.controller.onSubmit).toBeFunction();
    });

    describe('when invoking uniqueIdChanged', function() {

      it('does nothing with an empty participant ID', function() {
        spyOn(this.Participant, 'getByUniqueId').and.returnValue(this.$q.when(this.participant));

        this.createController();
        this.controller.uniqueId = '';
        this.controller.onSubmit();
        this.scope.$digest();

        expect(this.Participant.getByUniqueId).not.toHaveBeenCalled();
      });

      it('with a valid participant ID changes state', function() {
        spyOn(this.Participant, 'getByUniqueId').and.returnValue(this.$q.when(this.participant));
        spyOn(this.$state, 'go').and.returnValue('ok');

        this.createController();
        this.controller.uniqueId = this.factory.stringNext();
        this.controller.onSubmit();
        this.scope.$digest();

        expect(this.$state.go).toHaveBeenCalledWith(
          'home.collection.study.participant.summary',
          { participantId: this.participant.id });
      });

      it('with a NOT_FOUND opens a modal', function() {
        var uniqueId = this.factory.stringNext(),
            errorMsg = {
              status:  'error',
              message: 'EntityCriteriaNotFound: participant with unique ID does not exist: xxx'
            };

        spyOn(this.Participant, 'getByUniqueId').and.returnValue(this.$q.reject(errorMsg));
        spyOn(this.modalService, 'modalOkCancel').and.returnValue(this.$q.when('ok'));
        spyOn(this.$state, 'go').and.returnValue('ok');

        this.createController();
        this.controller.uniqueId = uniqueId;
        this.controller.onSubmit();
        this.scope.$digest();

        expect(this.modalService.modalOkCancel).toHaveBeenCalled();
        expect(this.$state.go).toHaveBeenCalledWith(
          'home.collection.study.participantAdd',
          { uniqueId: uniqueId });
      });

      it('with a NOT_FOUND opens a modal and cancel is pressed', function() {
        var uniqueId = this.factory.stringNext(),
            errorMsg = {
              status:  'error',
              message: 'EntityCriteriaNotFound: participant with unique ID does not exist: xxx'
            };

        spyOn(this.Participant, 'getByUniqueId').and.returnValue(this.$q.reject(errorMsg));
        spyOn(this.modalService, 'modalOkCancel').and.returnValue(this.$q.reject('Cancel'));
        spyOn(this.$state, 'reload').and.returnValue(null);

        this.createController();
        this.controller.uniqueId = uniqueId;
        this.controller.onSubmit();
        this.scope.$digest();

        expect(this.modalService.modalOkCancel).toHaveBeenCalled();
        expect(this.$state.reload).toHaveBeenCalled();
      });

      it('on a 404 response, when patient with unique id already exists, modal is shown to user', function() {
        spyOn(this.Participant, 'getByUniqueId').and.returnValue(
          this.$q.reject({
            status:  'error',
            message: 'EntityCriteriaError: participant not in study'
          }));
        spyOn(this.modalService, 'modalOk').and.returnValue(this.$q.when('Ok'));

        this.createController();
        this.controller.uniqueId = this.factory.stringNext();
        this.controller.onSubmit();
        this.scope.$digest();

        expect(this.modalService.modalOk).toHaveBeenCalled();
      });

      it('promise is rejected on a non 404 response', function() {
        spyOn(this.Participant, 'getByUniqueId').and.returnValue(this.$q.reject(
          { status: 400, data: { message: 'xxx' } }));
        spyOn(this.$log, 'error').and.callThrough();

        this.createController();
        this.controller.uniqueId = this.factory.stringNext();
        this.controller.onSubmit();
        this.scope.$digest();

        expect(this.$log.error).toHaveBeenCalled();
      });

    });

  });

});

define(['../module', 'underscore'], function(module, _) {
  'use strict';

  module.factory('ParticipantAnnotationType', ParticipantAnnotationTypeFactory);

  ParticipantAnnotationTypeFactory.$inject = [
    'validationService',
    'participantAnnotationTypeValidation',
    'StudyAnnotationType',
    'StudyAnnotTypesService',
    'participantAnnotTypesService'
  ];

  /**
   *
   */
  function ParticipantAnnotationTypeFactory(validationService,
                                            participantAnnotationTypeValidation,
                                            StudyAnnotationType,
                                            StudyAnnotTypesService,
                                            participantAnnotTypesService) {

    function ParticipantAnnotationType(obj) {
      obj = obj || {};
      StudyAnnotationType.call(this, obj);

      this.required = obj.required || false;
      this._service = participantAnnotTypesService;
      this._validateAddedEvent = participantAnnotationTypeValidation.validateAddedEvent;
      this._validateUpdatedEvent = participantAnnotationTypeValidation.validateUpdatedEvent;
    }

    ParticipantAnnotationType.prototype = Object.create(StudyAnnotationType.prototype);

    ParticipantAnnotationType.create = function(obj) {
      return new ParticipantAnnotationType(obj);
    };

    ParticipantAnnotationType.list = function(studyId) {
      return StudyAnnotationType.list(participantAnnotationTypeValidation.validateObj,
                                      ParticipantAnnotationType.create,
                                      'pannottypes',
                                      studyId);
    };

    ParticipantAnnotationType.get = function(studyId, annotationTypeId) {
      return StudyAnnotationType.get(participantAnnotationTypeValidation.validateObj,
                                     ParticipantAnnotationType.create,
                                     'pannottypes',
                                     studyId,
                                     annotationTypeId);
    };

    ParticipantAnnotationType.prototype.addOrUpdate = function () {
      return StudyAnnotationType.prototype.addOrUpdate.call(this).then(function (reply) {
        if (reply instanceof Error) {
          return reply;
        }
        return new ParticipantAnnotationType(reply);
      });
    };

    return ParticipantAnnotationType;
  }

});
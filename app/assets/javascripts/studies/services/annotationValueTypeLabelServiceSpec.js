/**
 * Jasmine test suite
 *
 */
/* global angular */

import _ from 'lodash';
import sharedBehaviour from '../../test/labelServiceSharedBehaviour';

describe('shipmentStateLabelService', function() {

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function(TestSuiteMixin) {
      _.extend(this, TestSuiteMixin.prototype);
      this.injectDependencies('annotationValueTypeLabelService',
                              'AnnotationValueType');
    });
  });

  describe('shared behaviour', function() {
    var context = {};
    beforeEach(function() {
      var self = this;

      context.labels = _.values(this.AnnotationValueType);
      context.toLabelFunc = this.annotationValueTypeLabelService.valueTypeToLabelFunc;
      context.expectedLabels = [];
      _.values(this.AnnotationValueType).forEach(function (valueType) {
        if (valueType === self.AnnotationValueType.DATE_TIME) {
          context.expectedLabels[valueType] = 'Date and time';
        } else {
          context.expectedLabels[valueType] = self.capitalizeFirstLetter(valueType);
        }
      });
    });
    sharedBehaviour(context);
  });

  it('name', function() {
    var labels = this.annotationValueTypeLabelService.getLabels(),
        labelIds = _.map(labels, 'id');
    expect(labels.length).toBe(_.keys(this.AnnotationValueType).length);
    _.values(this.AnnotationValueType).forEach(function (valueType) {
      expect(labelIds).toContain(valueType);
    });
    _.map(labels, 'labelFunc').forEach(function (labelFunc) {
      expect(labelFunc).toBeFunction();
    });
  });

});

/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import _ from 'lodash';

describe('annotationsInputModule', function() {

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function (TestSuiteMixin) {
      _.extend(this, TestSuiteMixin.prototype);

      this.injectDependencies('$rootScope',
                              '$compile',
                              'annotationFactory',
                              'AnnotationType',
                              'AnnotationValueType',
                              'AnnotationMaxValueCount',
                              'factory');
      this.createAnnotation = (valueType) =>
        this.annotationFactory.create(
          undefined,
          new this.AnnotationType(
            this.factory.annotationType({ valueType: valueType, required: true })
          ));

      this.createController = (annotations) => {
        this.element = angular.element([
          '<form name="form">',
          '  <annotations-input annotations="vm.annotations">',
          '  </annotations-input>',
          '</form>'
        ].join(''));

        this.scope = this.$rootScope.$new();
        this.scope.vm = { annotations: annotations };
        this.$compile(this.element)(this.scope);
        this.scope.$digest();
        this.controller = this.element.controller('annotationsInput');
      };

    });
  });

  it('works for a TEXT annotation', function() {
    var annotationValue = this.factory.stringNext(),
        annotations = [ this.createAnnotation(this.AnnotationValueType.TEXT) ];

    this.createController(annotations);
    expect(this.element.find('input').length).toBe(1);
    expect(this.element.find('input').eq(0).attr('type')).toBe('text');
    this.scope.form.annotationSubForm.annotationTextValue.$setViewValue(annotationValue);
    expect(this.scope.vm.annotations[0].value).toBe(annotationValue);
    expect(this.scope.form.annotationSubForm.annotationTextValue.$valid).toBe(true);
  });

  it('works for a NUMBER annotation and a valid number', function() {
    var annotationValue = 123.01,
        annotations = [ this.createAnnotation(this.AnnotationValueType.NUMBER) ];

    this.createController(annotations);
    expect(this.element.find('input').length).toBe(1);
    expect(this.element.find('input').eq(0).attr('type')).toBe('number');
    this.scope.form.annotationSubForm.annotationNumberValue.$setViewValue(annotationValue.toString());
    expect(this.scope.vm.annotations[0].value).toBe(annotationValue);
    expect(this.scope.form.annotationSubForm.annotationNumberValue.$valid).toBe(true);
  });

  it('validation fails for a NUMBER annotation and an invalid number', function() {
    var annotationValue = this.factory.stringNext(),
        annotations = [ this.createAnnotation(this.AnnotationValueType.NUMBER) ];

    this.createController(annotations);
    expect(this.element.find('input').length).toBe(1);
    expect(this.element.find('input').eq(0).attr('type')).toBe('number');
    this.scope.form.annotationSubForm.annotationNumberValue.$setViewValue(annotationValue);
    expect(this.scope.vm.annotations[0].value).toBeUndefined();
    expect(this.scope.form.annotationSubForm.annotationNumberValue.$valid).toBe(false);
  });

  it('works for a DATE_TIME annotation and a valid date', function() {
    var dateStr = '2010-01-10 00:00',
        annotation = this.createAnnotation(this.AnnotationValueType.DATE_TIME),
        annotations = [ annotation ];

    this.createController(annotations);
    expect(this.element.find('input').length).toBe(1);
    expect(this.element.find('input').eq(0).attr('type')).toBe('text');

    this.scope.form.annotationSubForm.dateTimePickerSubForm.date.$setViewValue(dateStr);

    expect(this.scope.vm.annotations[0].getValue()).toBe(dateStr);
    expect(this.scope.form.annotationSubForm.dateTimePickerSubForm.$valid).toBe(true);
  });

  it('works for a SELECT single annotation', function() {
    var self = this,
        annotationType, annotations;

    annotationType = new self.AnnotationType(
      self.factory.annotationType({
        valueType:     self.AnnotationValueType.SELECT,
        maxValueCount: self.AnnotationMaxValueCount.SELECT_SINGLE,
        options:       [ 'option1', 'option2' ],
        required:      true
      }));

    annotations = [ self.annotationFactory.create(undefined, annotationType) ];

    this.createController(annotations);
    expect(self.element.find('select').length).toBe(1);

    // number of options is the number of annotationType options plus one for the '-- make a selection --'
    // option
    expect(self.element.find('select option').length).toBe(annotationType.options.length + 1);

    annotationType.options.forEach((option) => {
      self.scope.form.annotationSubForm.annotationSelectValue.$setViewValue(option);
      expect(self.scope.vm.annotations[0].value).toBe(option);
      expect(self.scope.form.annotationSubForm.annotationSelectValue.$valid).toBe(true);
    });
  });

  it('works for a SELECT multiple annotation', function() {
    var annotationType, annotation;

    annotationType = new this.AnnotationType(
      this.factory.annotationType({
        valueType: this.AnnotationValueType.SELECT,
        maxValueCount: this.AnnotationMaxValueCount.SELECT_MULTIPLE,
        options: [ 'option1', 'option2', 'option3' ],
        required: true }));

    annotation = this.annotationFactory.create(undefined, annotationType);

    this.createController([ annotation ]);

    // has the right number of check boxes
    expect(this.element.find('input').length).toBe(3);

    expect(this.element.find('label span').eq(0)).toHaveText(annotationType.options[0]);
    expect(this.element.find('label span').eq(1)).toHaveText(annotationType.options[1]);
    expect(this.element.find('label span').eq(2)).toHaveText(annotationType.options[2]);
  });

  // For a required SELECT MULTIPLE annotation type
  it('selecting and unselecting an option for a required SELECT MULTIPLE makes the form invalid',
     function() {
       var self = this,
           annotationType, annotation;

       annotationType = new self.AnnotationType(
         self.factory.annotationType({
           valueType:     self.AnnotationValueType.SELECT,
           maxValueCount: self.AnnotationMaxValueCount.SELECT_MULTIPLE,
           options:       [ 'option1', 'option2', 'option3' ],
           required:      true
         }));

       annotation = self.annotationFactory.create(undefined, annotationType);

       this.createController([ annotation ]);

       // has the right number of check boxes
       expect(self.element.find('input').length).toBe(annotationType.options.length);

       _.range(annotationType.options.length).forEach((inputNum) => {
         self.element.find('input').eq(inputNum).click();
         expect(self.scope.form.annotationSubForm.annotationSelectValue.$valid).toBe(true);
         self.element.find('input').eq(inputNum).click();
         expect(self.scope.form.annotationSubForm.annotationSelectValue.$valid).toBe(false);
       });
     });

});
/**
 * Jasmine test suite
 *
 */
/* global angular */

import { ComponentTestSuiteMixin } from 'test/mixins/ComponentTestSuiteMixin';
import ProcessingTypeFixture from 'test/fixtures/ProcessingTypeFixture';
import ngModule from '../../../../../app';

describe('processingTypeInputComponent', function() {

  beforeEach(() => {
    angular.mock.module(ngModule, 'biobank.test');
    angular.mock.inject(function() {
      Object.assign(this, ComponentTestSuiteMixin);

      this.injectDependencies('$q',
                              '$httpBackend',
                              'Study',
                              'ProcessingType',
                              'CollectionEventType',
                              'ProcessingTypeAdd',
                              'ProcessingTypeAddTasks',
                              'Factory');

      this.processingTypeFixture = new ProcessingTypeFixture(this.Factory,
                                                             this.Study,
                                                             this.CollectionEventType,
                                                             this.ProcessingType);

      this.init();
      this.createController = (study, plainProcessingTypes = []) => {
        this.$httpBackend.expectGET(this.url('studies/proctypes/spcdefs', study.id))
          .respond(this.reply(plainProcessingTypes));

        this.createControllerInternal(
          '<processing-type-input study="vm.study"> <processing-type-input>',
          { study },
          'processingTypeInput');
      };

      this.stateInit = (plainStudy) => {
        this.$httpBackend.expectGET(this.url('studies', plainStudy.slug))
          .respond(this.reply(plainStudy));

        this.gotoUrl(`/admin/studies/${plainStudy.slug}/processing/add/input`);
        this.$httpBackend.flush();
        expect(this.$state.current.name).toBe('home.admin.studies.study.processing.addType.input');
      };
    });
  });

  it('has valid initialization', function() {
    this.ProcessingTypeAdd.init();
    this.ProcessingTypeAdd.initIfRequired = jasmine.createSpy().and.callThrough();
    this.ProcessingTypeAdd.isValid = jasmine.createSpy().and.returnValue(true);
    const study = this.Study.create(this.Factory.study());
    this.createController(study);

    expect(this.ProcessingTypeAdd.initIfRequired).toHaveBeenCalled();

    expect(this.controller.progressInfo).toBeDefined();
    const taskData = this.ProcessingTypeAddTasks.getTaskData();

    expect(this.controller.progressInfo).toBeDefined();
    expect(this.controller.progressInfo).toBeArrayOfSize(Object.keys(taskData).length);
    taskData.forEach((taskInfo, index) => {
      taskInfo.status = (index < 2);
      expect(this.controller.progressInfo).toContain(taskInfo);
    });
  });

  it('returns to first sibling state if service is not initialized', function() {
    const f = this.processingTypeFixture.fixture();
    this.stateInit(f.plainStudy);
    this.ProcessingTypeAdd.isValid = jasmine.createSpy().and.returnValue(false);
    this.createController(f.study);
    this.$rootScope.$digest();
    expect(this.$state.current.name).toBe('home.admin.studies.study.processing.addType.information');
  });

  it('`getCollectionSpecimenDefinitions` makes a request to the server', function() {
    const f = this.processingTypeFixture.fixture();
    this.ProcessingTypeAdd.isValid = jasmine.createSpy().and.returnValue(true);

    this.ProcessingTypeAdd.getCollectionSpecimenDefinitions =
      jasmine.createSpy().and.returnValue(f.collectionSpecimenDefinitionNames);

    this.createController(f.study);
    this.controller.getCollectionSpecimenDefinitions();

    expect(this.ProcessingTypeAdd.getCollectionSpecimenDefinitions).toHaveBeenCalled();
  });

  it('`getProcessedSpecimenDefinitions` make a request to the server', function() {
    const f = this.processingTypeFixture.fixture({
      numEventTypes: 1,
      numProcessingTypesFromCollected: 1,
      numProcessingTypesFromProcessed: 1
    });

    this.ProcessingTypeAdd.processingType = f.processingTypesFromProcessed[0].processingType;
    this.createController(f.study, f.processedSpecimenDefinitionNames);

    this.$httpBackend.expectGET(this.url('studies/proctypes/spcdefs', f.study.id))
      .respond(this.reply(f.processedSpecimenDefinitionNames));
    this.controller.getProcessedSpecimenDefinitions();
    this.$httpBackend.flush();

    expect(this.ProcessingTypeAdd.processingTypes).toBeNonEmptyArray();
  });

  describe('for state transitions', function() {

    beforeEach(function() {
      this.fixture = this.processingTypeFixture.fixture();
      this.stateInit(this.fixture.plainStudy);
      this.ProcessingTypeAdd.processingType = this.fixture.processingTypesFromProcessed[0].processingType;
      this.createController(this.fixture.study);
    });

    it('when `previous` is called', function() {
      const processingType = this.fixture.processingTypesFromProcessed[0].processingType;
      this.controller.previous(processingType);
      this.$rootScope.$digest();
      expect(this.$state.current.name).toBe('home.admin.studies.study.processing.addType.information');
      expect(this.ProcessingTypeAdd.processingType).toBe(processingType);
    });

    it('when `next` is called', function() {
      const processingType = this.fixture.processingTypesFromProcessed[0].processingType;
      this.controller.next(processingType);
      this.$rootScope.$digest();
      expect(this.$state.current.name).toBe('home.admin.studies.study.processing.addType.output');
      expect(this.ProcessingTypeAdd.processingType).toBe(processingType);
    });

    it('when `cancel` is called', function() {
      this.controller.cancel();
      this.$rootScope.$digest();
      expect(this.$state.current.name).toBe('home.admin.studies.study.processing');
    });

  });

});

/**
 * Jasmine test suite
 *
 */
/* global angular */

import { entityInfoCreateSharedBehaviour,
         entityInfoListSharedBehaviour } from 'test/behaviours/entityInfoSharedBehaviour';
import { EntityTestSuiteMixin } from 'test/mixins/EntityTestSuiteMixin';
import { ServerReplyMixin } from 'test/mixins/ServerReplyMixin';
import ngModule from '../../index'

describe('CollectionEventTypeName', function() {

  beforeEach(() => {
    angular.mock.module(ngModule, 'biobank.test')
    angular.mock.inject(function() {
      Object.assign(this, EntityTestSuiteMixin, ServerReplyMixin)

      this.injectDependencies('$httpBackend',
                              '$httpParamSerializer',
                              'EntityInfo',
                              'CollectionEventTypeName',
                              'Factory')
      this.url = (...paths) => {
        const args = [ 'studies/cetypes/names' ].concat(paths);
        return EntityTestSuiteMixin.url.apply(null, args);
      }
    })
  })

  afterEach(function() {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('create behaviour', function() {

    var context = {};

    beforeEach(function() {
      let eventType;

      context.constructor = this.CollectionEventTypeName;
      context.createFunc  = this.CollectionEventTypeName.create;
      context.restApiUrl  = (...paths) => this.url([eventType.studyId].concat(paths));
      context.jsonFactoryFunc = () => {
        const result = this.Factory.collectionEventTypeNameDto();
        eventType = this.Factory.defaultCollectionEventType();
        return result;
      }
      context.listFunc = (options) => this.CollectionEventTypeName.list(eventType.studyId, options);
    });

    entityInfoCreateSharedBehaviour(context)

  });

  describe('list behaviour', function() {

    var context = {};

    beforeEach(function() {
      let eventType;

      context.constructor = this.CollectionEventTypeName;
      context.restApiUrl  = (...paths) => this.url([eventType.studyId].concat(paths));
      context.jsonFactoryFunc = () => {
        const result = this.Factory.collectionEventTypeNameDto();
        eventType = this.Factory.defaultCollectionEventType();
        return result;
      }
      context.listFunc = (options) => this.CollectionEventTypeName.list(eventType.studyId, options);
    });

entityInfoListSharedBehaviour(context)

  });

})

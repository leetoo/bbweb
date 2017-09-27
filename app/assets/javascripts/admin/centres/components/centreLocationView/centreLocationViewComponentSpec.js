/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2017 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import _ from 'lodash';
import faker from 'faker';
import sharedBehaviour from '../../../../test/locationUpdateSharedBehaviourSpec';

  describe('Component: centreLocationView', function() {

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function (ComponentTestSuiteMixin) {
      _.extend(this, ComponentTestSuiteMixin.prototype);

      this.injectDependencies('$rootScope',
                              '$compile',
                              '$state',
                              'Centre',
                              'Location',
                              'factory');

      this.location = new this.Location(this.factory.location());
      this.centre = new this.Centre(this.factory.centre({ locations: [ this.location ]}));
      this.returnStateName = 'home.admin.centres.centre.locations';

      this.createController = (centre, location) => {
        centre = centre || this.centre;
        location = location || this.location;

        ComponentTestSuiteMixin.prototype.createController.call(
          this,
          '<centre-location-view centre="vm.centre" location="vm.location"></centre-location-view>',
          {
            centre: centre,
            location: location
          },
          'centreLocationView');
      };
    });
  });

    it('scope should be valid', function() {
      this.createController();
      expect(this.controller.centre).toBe(this.centre);
      expect(this.controller.location).toBe(this.location);
      expect(this.controller.back).toBeFunction();
      expect(this.controller.editName).toBeFunction();
      expect(this.controller.editStreet).toBeFunction();
      expect(this.controller.editCity).toBeFunction();
      expect(this.controller.editProvince).toBeFunction();
      expect(this.controller.editPostalCode).toBeFunction();
      expect(this.controller.editPoBoxNumber).toBeFunction();
      expect(this.controller.editCountryIsoCode).toBeFunction();
    });

    it('should return to valid state when back is called', function() {
      this.createController();
      spyOn(this.$state, 'go').and.returnValue(null);
      this.controller.back();
      expect(this.$state.go).toHaveBeenCalledWith(this.returnStateName, {}, { reload: true });
    });

    describe('updates to location', function () {

      var context = {};

      beforeEach(inject(function () {
        context.entity                   = this.centre;
        context.entityUpdateFuncName     = 'updateLocation';
        context.createController         = this.createController;
        context.location                 = this.centre.locations[0];
      }));

      describe('updates to location name', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editName';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

      describe('updates to location street', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editStreet';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

      describe('updates to location city', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editCity';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

      describe('updates to location province', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editProvince';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

      describe('updates to location postal code', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editPostalCode';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

      describe('updates to location PO box number', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editPoBoxNumber';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

      describe('updates to location country ISO code', function () {

        beforeEach(inject(function () {
          context.controllerUpdateFuncName = 'editCountryIsoCode';
          context.modalInputFuncName       = 'text';
          context.newValue                 = faker.random.word();
        }));

        sharedBehaviour(context);

      });

    });


  });

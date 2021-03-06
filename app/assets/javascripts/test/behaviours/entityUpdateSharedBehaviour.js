/*
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2018 Canadian BioSample Repository (CBSR)
 */
define(function() {
  'use strict';

  /**
   * @param {object} context.entity the entity to be update.
   *
   * @param {string} context.updateFuncName the name of the function that does the update.
   *
   * @param {string} context.controllerFuncname the name of the function on the controller to invoke.
   *
   * @param {string} context.modalInputFuncName the name of the ""modalInput" service function that is called
   * to ask the user for input.
   *
   * @param {any} context.newValue the new value to assign.
   *
   * @param {function} this.createController a function that creates the controller.
   *
   * @param {object} this.controller the controller.
   *
   * @param {object} this.scope the scope bound to the controller.
   */
  function entityUpdateSharedSpec(context) {

    describe('update functions', function () {

      beforeEach(function () {
        this.injectDependencies('$q', 'modalInput');
        this.deferred = this.$q.defer();
        spyOn(this.modalInput, context.modalInputFuncName)
          .and.returnValue({ result: this.deferred.promise });
      });

      it('context should be valid', function() {
        expect(context.entity.prototype[context.updateFuncName]).toBeFunction();
        expect(this.modalInput[context.modalInputFuncName]).toBeFunction();
      });

      it('should update a field on the enitity', function() {
        this.deferred.resolve(context.newValue);
        spyOn(context.entity.prototype, context.updateFuncName).and.returnValue(this.$q.when(context.entity));

        context.createController();
        expect(this.controller[context.controllerFuncName]).toBeFunction();
        this.controller[context.controllerFuncName]();
        this.scope.$digest();
        expect(context.entity.prototype[context.updateFuncName])
          .toHaveBeenCalledWith(context.newValue);
        expect(this.modalInput[context.modalInputFuncName]).toHaveBeenCalled();
      });

      it('should display an error in a modal when update fails', function() {
        var newValue = this.Factory.stringNext();

        this.deferred.resolve(newValue);
        expect(context.entity.prototype[context.updateFuncName]).toBeFunction();

        spyOn(this.notificationsService, 'updateError');

        context.createController();
        context.entity.prototype[context.updateFuncName] = jasmine.createSpy()
          .and.returnValue(this.$q.reject('simulated error  ---->'));
        expect(this.controller[context.controllerFuncName]).toBeFunction();
        this.controller[context.controllerFuncName]();
        this.scope.$digest();
        expect(this.notificationsService.updateError).toHaveBeenCalled();
      });

    });

  }

  return entityUpdateSharedSpec;
});

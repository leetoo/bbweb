/**
 * Jasmine test suite
 *
 */
/* global angular */

import { ShippingComponentTestSuiteMixin } from 'test/mixins/ShippingComponentTestSuiteMixin';
import ngModule from '../../index'

describe('shipmentAddItemsComponent', function() {

  beforeEach(() => {
    angular.mock.module(ngModule, 'biobank.test');
    angular.mock.inject(function() {
      Object.assign(this, ShippingComponentTestSuiteMixin);

      this.injectDependencies('$q',
                              '$rootScope',
                              '$compile',
                              '$state',
                              'toastr',
                              'Shipment',
                              'shipmentSendTasksService',
                              'modalInput',
                              'modalService',
                              'shipmentSkipToSentModalService',
                              'domainNotificationService',
                              'notificationsService',
                              'Factory');
      this.addCustomMatchers();

      this.createController = (shipment) =>
        this.createControllerInternal(
          '<shipment-add-items shipment="vm.shipment"></shipment-add-items',
          { shipment: shipment },
          'shipmentAddItems');
    });
  });

  it('should have valid scope', function() {
    var shipment = this.createShipment();
    this.createController(shipment);
    expect(this.controller.shipment).toBe(shipment);
    expect(this.controller.progressInfo).toBeDefined();

    const taskData = this.shipmentSendTasksService.getTaskData();
    taskData[0].status = true;
    taskData[1].status = true;
    expect(this.controller.progressInfo).toBeArrayOfSize(Object.keys(taskData).length);
    taskData.forEach(taskInfo => {
      expect(this.controller.progressInfo).toContain(taskInfo);
    });
    expect(this.controller.progressInfo[0].status).toBeTrue();
    expect(this.controller.progressInfo[1].status).toBeTrue();

    expect(this.controller.tagAsPacked).toBeFunction();
    expect(this.controller.tagAsSent).toBeFunction();
    expect(this.controller.removeShipment).toBeFunction();
  });

  describe('can change state to packed on shipment', function() {

    beforeEach(function() {
      this.shipment = this.createShipmentWithSpecimens(1);

      spyOn(this.Shipment, 'get').and.returnValue(this.$q.when(this.shipment));
      spyOn(this.$state, 'go').and.returnValue(null);
    });

    it('can tag a shipment as packed', function() {
      var self = this,
          promiseSuccess;

      spyOn(this.Shipment.prototype, 'pack').and.returnValue(this.$q.when(this.shipment));
      spyOn(this.modalInput, 'dateTime').and.returnValue({ result: this.$q.when(new Date()) });

      this.createController(this.shipment);
      this.controller.tagAsPacked().then(function () {
        expect(self.Shipment.prototype.pack).toHaveBeenCalled();
        expect(self.$state.go).toHaveBeenCalledWith('home.shipping.shipment',
                                                    { shipmentId: self.shipment.id});
        promiseSuccess = true;
      });
      this.scope.$digest();
      expect(promiseSuccess).toBeTrue();
    });

  });

  describe('when tagging as sent', function() {

    beforeEach(function() {
      this.shipment = this.createShipmentWithSpecimens(1);
      spyOn(this.Shipment, 'get').and.returnValue(this.$q.when(this.shipment));
      spyOn(this.shipmentSkipToSentModalService, 'open').and
        .returnValue({
          result: this.$q.when({
            timePacked: new Date(),
            timeSent: new Date()
          })
        });
    });

    it('can tag a shipment as sent', function() {
      var self = this,
          promiseSuccess;

      spyOn(this.$state, 'go').and.returnValue(null);
      spyOn(this.Shipment.prototype, 'skipToStateSent').and.returnValue(this.$q.when(this.shipment));

      this.createController(this.shipment);
      this.controller.tagAsSent().then(function () {
        expect(self.Shipment.prototype.skipToStateSent).toHaveBeenCalled();
        expect(self.$state.go).toHaveBeenCalledWith('home.shipping.shipment',
                                                    { shipmentId: self.shipment.id },
                                                    { reload: true });
        promiseSuccess = true;
      });
      this.scope.$digest();
      expect(promiseSuccess).toBeTrue();
    });

    it('user is informed if shipment cannot be tagged as sent', function() {
      var self = this,
          errorMsgs = [
            'TimeSentBeforePacked',
            'simulated error'
          ];

      spyOn(this.toastr, 'error').and.returnValue(null);
      this.createController(this.shipment);
      errorMsgs.forEach(function (errMsg, index) {
        var args;

        self.Shipment.prototype.skipToStateSent =
          jasmine.createSpy().and.returnValue(self.$q.reject({ message: errMsg }));

        self.controller.tagAsSent();
        self.scope.$digest();
        expect(self.toastr.error.calls.count()).toBe(index + 1);

        if (errMsg === 'TimeReceivedBeforeSent') {
          args = self.toastr.error.calls.argsFor(index);
          expect(args[0]).toContain('The received time is before the sent time');
        }
      });
    });

  });

  describe('not allowed to change state', function() {

    beforeEach(function() {
      this.shipment = this.createShipmentWithSpecimens(0);
      spyOn(this.Shipment, 'get').and.returnValue(this.$q.when(this.shipment));
      spyOn(this.modalService, 'modalOk').and.returnValue(this.$q.when('OK'));
      this.createController(this.shipment);
    });

    it('to packed when no specimens in shipment', function() {
      var self = this,
          promiseFailed;

      this.controller.tagAsPacked().catch(function () {
        expect(self.modalService.modalOk).toHaveBeenCalled();
        promiseFailed = true;
      });
      this.scope.$digest();
      expect(promiseFailed).toBeTrue();
    });

    it('to sent when no specimens in shipment', function() {
      var self = this,
          promiseFailed;

      this.controller.tagAsSent().catch(function () {
        expect(self.modalService.modalOk).toHaveBeenCalled();
        promiseFailed = true;
      });
      this.scope.$digest();
      expect(promiseFailed).toBeTrue();
    });

  });

  it('can remove a shipment', function() {
    var shipment = this.createShipment();

    spyOn(this.modalService, 'modalOkCancel').and.returnValue(this.$q.when('OK'));
    spyOn(this.Shipment.prototype, 'remove').and.returnValue(this.$q.when(true));
    spyOn(this.notificationsService, 'success').and.returnValue(null);
    spyOn(this.$state, 'go').and.returnValue(null);

    this.createController(shipment);
    this.controller.removeShipment();
    this.scope.$digest();

    expect(this.Shipment.prototype.remove).toHaveBeenCalled();
    expect(this.notificationsService.success).toHaveBeenCalled();
    expect(this.$state.go).toHaveBeenCalledWith('home.shipping');
  });

  it('removal of a shipment can be cancelled', function() {
    var shipment = this.createShipment();

    spyOn(this.Shipment.prototype, 'remove').and.returnValue(this.$q.when(true));

    this.createController(shipment);
    spyOn(this.modalService, 'modalOkCancel').and.returnValue(this.$q.reject('Cancel'));
    this.controller.removeShipment();
    this.scope.$digest();

    expect(this.Shipment.prototype.remove).not.toHaveBeenCalled();
  });

  it('removeShipment does nothing if shipment is not defined', function() {
    var shipment = this.createShipment();

    spyOn(this.Shipment.prototype, 'remove').and.returnValue(this.$q.when(true));

    this.createController(shipment);
    spyOn(this.modalService, 'modalOkCancel').and.returnValue(this.$q.reject('Cancel'));
    this.controller.removeShipment();
    this.scope.$digest();

    expect(this.Shipment.prototype.remove).not.toHaveBeenCalled();
  });

});

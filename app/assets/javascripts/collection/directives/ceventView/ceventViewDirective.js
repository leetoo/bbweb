/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
define(function (require) {
  'use strict';

  /**
   *
   */
  function ceventViewDirective() {
    var directive = {
      restrict: 'EA',
      scope: {},
      bindToController: {
        study:                '=',
        collectionEventTypes: '=',
        collectionEvent:      '='
      },
      templateUrl : '/assets/javascripts/collection/directives/ceventView/ceventView.html',
      controller: CeventViewCtrl,
      controllerAs: 'vm'
    };
    return directive;
  }

  CeventViewCtrl.$inject = [
    '$state',
    'gettext',
    'gettextCatalog',
    'Specimen',
    'timeService',
    'modalService',
    'modalInput',
    'domainEntityService',
    'notificationsService',
    'annotationUpdate'
  ];

  /**
   *
   */
  function CeventViewCtrl($state,
                          gettext,
                          gettextCatalog,
                          Specimen,
                          timeService,
                          modalService,
                          modalInput,
                          domainEntityService,
                          notificationsService,
                          annotationUpdate) {
    var vm = this;

    vm.canUpdateVisitType = (vm.collectionEventTypes.length > 1);
    vm.panelOpen          = true;

    vm.editVisitType                  = editVisitType;
    vm.editTimeCompleted              = editTimeCompleted;
    vm.editAnnotation                 = editAnnotation;
    vm.panelButtonClicked             = panelButtonClicked;
    vm.remove                         = remove;
    vm.getAnnotationUpdateButtonTitle = getAnnotationUpdateButtonTitle;

    //--

    function postUpdate(message, title, timeout) {
      return function (cevent) {
        vm.collectionEvent = cevent;
        notificationsService.success(message, title, timeout);
      };
    }

    function editVisitType() {
      if (vm.collectionEventTypes.length <= 1) {
        throw new Error('only a single collection event type is defined for this study');
      }
    }

    function editTimeCompleted() {
      modalInput.dateTime(gettext('Update time completed'),
                          gettext('Time completed'),
                          vm.collectionEvent.timeCompleted,
                          { required: true })
        .result.then(function (timeCompleted) {
          vm.collectionEvent.updateTimeCompleted(timeService.dateToUtcString(timeCompleted))
            .then(postUpdate(gettext('Time completed updated successfully.'),
                             gettext('Change successful'),
                             1500))
            .catch(notificationsService.updateError);
        });
    }

    function editAnnotation(annotation) {
      annotationUpdate.update(annotation, 'Update ' + annotation.getLabel())
        .then(function (newAnnotation) {
          vm.collectionEvent.addAnnotation(newAnnotation)
            .then(postUpdate(gettext('Annotation updated successfully.'),
                             gettext('Change successful'),
                             1500))
            .catch(notificationsService.updateError);
        });
    }

    function panelButtonClicked() {
      vm.panelOpen = !vm.panelOpen;
    }

    function remove() {
      Specimen.list(vm.collectionEvent.id).then(function (pagedResult) {
        if (pagedResult.items.length > 0) {
          modalService.modalOk(
            gettext('Cannot remove collection event'),
            gettext('This collection event has specimens. Please remove the specimens first.'));
        } else {
          domainEntityService.removeEntity(
            promiseFn,
            gettext('Remove event'),
            /// visit number comes from the collection event
            gettextCatalog.getString(
              'Are you sure you want to remove event with visit # <strong>{{visitNumber}}</strong>?',
              { visitNumber: vm.collectionEvent.visitNumber}),
            gettext('Remove failed'),
            gettextCatalog.getString(
              'Collection event with visit number {{visitNumber}} cannot be removed',
              { visitNumber: vm.collectionEvent.visitNumber}));
        }

        function promiseFn() {
          return vm.collectionEvent.remove().then(function () {
            notificationsService.success(gettext('Collection event removed'));
            $state.go('home.collection.study.participant.cevents', {}, { reload: true });
          });
        }
      });
    }

    function getAnnotationUpdateButtonTitle(annotation) {
      /// label is a name assigned by the user for an annotation type
      return gettextCatalog.getString('Update {{label}}', { label: annotation.getLabel() });
    }

  }

  return ceventViewDirective;
});

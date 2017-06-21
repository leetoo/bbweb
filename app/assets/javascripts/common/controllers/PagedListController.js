/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2016 Canadian BioSample Repository (CBSR)
 */
define(function (require) {
  'use strict';

  var _ = require('lodash');

  PagedListController.$inject = ['vm', 'gettextCatalog'];

  /**
   * Base class for controllers that display items in a paged fashion.
   *
   * Allows items to be filtered by name and / or state. Additional filters can be used by defining
   * <code>vm.getAdditionalFilters</code> and <code>vm.clearAdditionalFilters</code>.
   *
   * @param {object} vm - The derived controller object.
   *
   * @param {function} vm.getItems - A function that returns a promise of PagedResult to display on a single
   * page.
   *
   * @param {int[]} vm.counts - The entity counts.
   *
   * @param {string[]} vm.stateData - an array of objects, used to filter entities by state. Each object has 2
   *        keys: <code>id</code> and <code>name</code>. The value for the <code>id</code> key is a state for
   *        the entities being displayed, and used with the $scope.getItems function. The value for the
   *        <code>name</code> key is what is displayed in the 'State' drop down box.
   *
   * @param {object} $scope - the scope object this controller inherits from.
   *
   * @param {AngularJs_Service} gettextCatalog - the service that provides string translations functions.
   *
   * @return {object} The base class object.
   */
  function PagedListController(vm, gettextCatalog) {
    vm.nameFilter         = '';
    vm.pagedResult        = { total: 0 };
    vm.sortFields         = [ gettextCatalog.getString('Name'), gettextCatalog.getString('State') ];
    vm.nameFilterUpdated  = nameFilterUpdated;
    vm.stateFilterUpdated = stateFilterUpdated;
    vm.selectedState      = 'all';
    vm.pageChanged        = pageChanged;
    vm.sortFieldSelected  = sortFieldSelected;
    vm.filtersCleared     = filtersCleared;
    vm.getFilters         = getFilters;
    vm.updateItems        = updateItems;

    vm.pagerOptions = {
      filter: '',
      sort:   'name', // must be lower case
      page:   1,
      limit:  vm.limit
    };

    vm.displayStates = {
      NO_ENTITIES: 0,
      NO_RESULTS: 1,
      HAVE_RESULTS: 2
    };

    vm.displayState = displayState();
    vm.displayState = displayState;

    updateItems();

    //---

    function displayState() {
      if (vm.counts && (vm.counts.total > 0) && vm.pagedResult) {
        if (vm.pagedResult.total > 0) {
          return vm.displayStates.HAVE_RESULTS;
        } else {
          return vm.displayStates.NO_RESULTS;
        }
      }
      return vm.displayStates.NO_ENTITIES;
    }

    function getFilters() {
      var filters = [],
          additionalFilters = [];

      if (vm.getAdditionalFilters) {
        additionalFilters = vm.getAdditionalFilters();
        if (additionalFilters.length > 0) {
          filters.push(additionalFilters);
        }
      }

      if (vm.nameFilter !== '') {
        filters.push('name:like:' + vm.nameFilter);
      }

      if (vm.selectedState && (vm.selectedState !== 'all')) {
        filters.push('state::' + vm.selectedState);
      }

      return filters;
    }

    function updateItems() {
      var filters = vm.getFilters();
      _.extend(vm.pagerOptions, { filter: filters.join(';') });

      vm.getItems(vm.pagerOptions).then(function (pagedResult) {
        vm.pagedResult = pagedResult;
        vm.pagedResult.items = _.map(vm.pagedResult.items, function (entity) {
          entity.icon = vm.getItemIcon(entity);
          return entity;
        });
        vm.displayState = displayState.call(vm);
      });
    }

    /*
     * Called when user enters text into the 'name filter'.
     */
    function nameFilterUpdated(nameFilter) {
      vm.nameFilter = nameFilter;
      vm.pagerOptions.page = 1;
      updateItems();
    }

    /*
     * Called when user selects a state from the 'state filter' select.
     */
    function stateFilterUpdated(selectedState) {
      vm.selectedState = selectedState;
      vm.pagerOptions.page = 1;
      updateItems();
    }

    function sortFieldSelected(sortField) {
      vm.pagerOptions.page = 1;
      vm.pagerOptions.sort = sortField.toLowerCase(); // must be lower case
      updateItems();
    }

    function pageChanged() {
      updateItems();
    }

    function filtersCleared() {
      if (vm.clearAdditionalFilters) {
        vm.clearAdditionalFilters();
      }
      vm.nameFilter = '';
      vm.selectedState = 'all';
      updateItems();
    }

  }

  return PagedListController;
});

/**
 * Configure routes of centres module.
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
define(function () {
  'use strict';

  centreStates.$inject = ['$urlRouterProvider', '$stateProvider', 'authorizationProvider'];

  function centreStates($urlRouterProvider, $stateProvider, authorizationProvider ) {

    resolveCentre.$inject = ['$stateParams', 'Centre'];
    function resolveCentre($stateParams, Centre) {
      return Centre.get($stateParams.centreId);
    }

    $urlRouterProvider.otherwise('/');

    /**
     * Centres - view all centres
     */
    $stateProvider.state('home.admin.centres', {
      url: '/centres',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser
      },
      views: {
        'main@': {
          templateUrl: '/assets/javascripts/admin/centres/centres.html',
          controller: 'CentresCtrl as vm'
        }
      },
      data: {
        displayName: 'Centres'
      }
    });

    /**
     * Centre add
     */
    $stateProvider.state('home.admin.centres.add', {
      url: '/add',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: ['Centre', function(Centre) {
          return new Centre();
        }]
      },
      views: {
        'main@': {
          templateUrl: '/assets/javascripts/admin/centres/centreForm.html',
          controller: 'CentreEditCtrl as vm'
        }
      },
      data: {
        displayName: 'Add centre'
      }
    });

    /**
     * Centre view
     */
    $stateProvider.state('home.admin.centres.centre', {
      abstract: true,
      url: '/{centreId}',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: resolveCentre
      },
      views: {
        'main@': {
          templateUrl: '/assets/javascripts/admin/centres/centreView.html',
          controller: 'CentreCtrl as vm'
        }
      },
      data: {
        breadcrumProxy: 'home.admin.centres.centre.summary'
      }
    });

    /**
     * Centre add
     */
    $stateProvider.state('home.admin.centres.centre.update', {
      url: '/add',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: resolveCentre
      },
      views: {
        'main@': {
          templateUrl: '/assets/javascripts/admin/centres/centreForm.html',
          controller: 'CentreEditCtrl as vm'
        }
      },
      data: {
        displayName: 'Add centre'
      }
    });

    /**
     * Centre view summary information
     */
    $stateProvider.state('home.admin.centres.centre.summary', {
      url: '/summary',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: resolveCentre
      },
      views: {
        'centreDetails': {
          templateUrl: '/assets/javascripts/admin/centres/centreSummaryTab.html',
          controller: 'CentreSummaryTabCtrl as vm'
        }
      },
      data: {
        displayName: '{{centre.name}}'
      }
    });

    /**
     * Centre view location information
     */
    $stateProvider.state('home.admin.centres.centre.locations', {
      url: '/locations',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        locations: ['centre', function(centre) {
          return centre.getLocations();
        }]
      },
      views: {
        'centreDetails': {
          template: [
            '<uib-accordion close-others="false">',
            '  <locations-panel centre="vm.centre">',
            '  </locations-panel>',
            '</uib-accordion>'
          ].join(''),
          controller: [
            'centre',
            function(centre) {
              this.centre = centre;
            }
          ],
          controllerAs: 'vm'
        }
      },
      data: {
        displayName: '{{centre.name}}'
      }
    });

    /**
     * Used to add a centre location.
     */
    $stateProvider.state('home.admin.centres.centre.locationAdd', {
      url: '/location/add',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: resolveCentre
      },
      views: {
        'main@': {
          templateUrl: '/assets/javascripts/admin/centres/locationForm.html',
          controller: 'LocationEditCtrl as vm'
        }
      },
      data: {
        displayName: 'Specimen Group'
      }
    });

    /**
     * Used to update a centre location.
     */
    $stateProvider.state('home.admin.centres.centre.locationUpdate', {
      url: '/location/update/:locationId',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: [
          '$stateParams', 'centre',
          function($stateParams, centre) {
            return centre.getLocation($stateParams.locationId);
          }
        ]
      },
      views: {
        'main@': {
          templateUrl: '/assets/javascripts/admin/centres/locationForm.html',
          controller: 'LocationEditCtrl as vm'
        }
      },
      data: {
        displayName: 'Specimen Group'
      }
    });

    /**
     * Centre view studies information
     */
    $stateProvider.state('home.admin.centres.centre.studies', {
      url: '/studies',
      resolve: {
        user: authorizationProvider.requireAuthenticatedUser,
        centre: resolveCentre,
        centreStudies: ['centre', function(centre) {
          return centre.getStudyIds();
        }],
        studyNames: ['studiesService', function(studiesService) {
          return studiesService.getStudyNames();
        }]
      },
      views: {
        'centreDetails': {
          template: [
            '<uib-accordion close-others="false">',
            '  <centre-studies-panel',
            '    centre="vm.centre" ',
            '    centre-studies="vm.centreStudies" ',
            '    study-names="vm.studyNames"> ',
            '    </centre-studies-panel>',
            '</uib-accordion>'
          ].join(''),
          controller: [
            'centre', 'centreStudies', 'studyNames',
            function(centre, centreStudies, studyNames) {
              var vm = this;
              vm.centre        = centre;
              vm.centreStudies = centreStudies;
              vm.studyNames    = studyNames;
            }
          ],
          controllerAs: 'vm'
        }
      },
      data: {
        displayName: '{{centre.name}}'
      }
    });
  }

  return centreStates;
});

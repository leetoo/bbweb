/**
 * Jasmine test suite
 *
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
/* global angular */

import _ from 'lodash';

describe('Directive: truncateToggle', function() {
  var textEmptyWarning = 'text not entered yet.';

  beforeEach(() => {
    angular.mock.module('biobankApp', 'biobank.test');
    angular.mock.inject(function (TestSuiteMixin) {
      _.extend(this, TestSuiteMixin.prototype);
      this.injectDependencies('$rootScope', '$compile', '$filter', 'gettextCatalog');

      this.createScope = (text, toggleLength) => {
        var self = this;

        self.element = angular.element(
          `<truncate-toggle
             text="model.text"
             toggle-length="model.toggleLength"
             text-empty-warning="${textEmptyWarning}">
          </truncate-toggle>`);

        self.scope = self.$rootScope.$new();

        self.scope.model = {
          text:         text,
          toggleLength: toggleLength
        };

        this.$compile(self.element)(self.scope);
        self.scope.$digest();
      };
    });
  });

  it('pressing the button truncates the string', function() {
    var divs,
        buttons,
        text = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 ' +
        '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 ';

    this.createScope(text, 20);

    divs = angular.element(this.element[0].getElementsByClassName('col-md-12'));
    expect(divs.length).toBe(1);
    expect(divs.eq(0).text()).toBe(text);

    buttons = this.element.find('button');
    expect(buttons.length).toBe(1);
    buttons.eq(0).click();
    expect(divs.eq(0).text().length).toBe(this.scope.model.toggleLength);
  });

  it('pressing the button twice displays whole string', function() {
    var divs,
        buttons,
        text = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 ' +
        '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 ';

    this.createScope(text, 20);

    divs = angular.element(this.element[0].getElementsByClassName('col-md-12'));
    expect(divs.length).toBe(1);

    buttons = this.element.find('button');
    expect(buttons.length).toBe(1);
    buttons.eq(0).click();
    buttons.eq(0).click();
    expect(divs.eq(0).text()).toBe(text);
  });

  it('button is labelled correctly', function() {
    var buttons,
        text = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 ' +
        '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 ';

    this.createScope(text, 20);
    buttons = this.element.find('button');
    expect(buttons.length).toBe(1);
    expect(buttons.eq(0).text().trim()).toBe(this.gettextCatalog.getString('Show less'));
  });

  it('if text is null then warning message is displayed', function() {
    var divs,
        text = '';

    this.createScope(text, 20);
    divs = angular.element(this.element[0].getElementsByClassName('alert'));
    expect(divs.length).toBe(1);
    expect(divs.eq(0).text().trim()).toBe(textEmptyWarning);
  });

});

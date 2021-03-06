/*
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2018 Canadian BioSample Repository (CBSR)
 */

/* @ngInject */
function CollectionEventTypeNameFactory($q,
                                        $log,
                                        biobankApi,
                                        EntityInfo,
                                        DomainEntity,
                                        DomainError) {

  /**
   * @classdesc A CollectionEventTypeName contains the ID, and name for a collectionEventType.
   *
   * Please do not use this constructor. It is meant for internal use.
   *
   * @class
   * @memberOf domain.studies
   * @extends domain.EntityInfo
   *
   * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
   * this class. Objects of this type are usually returned by the server's REST API.
   */
  class CollectionEventTypeName extends EntityInfo {

    /** @private */
    static url(studyId, ...paths) {
      const args = [ `studies/cetypes/names/${studyId}` ].concat(paths);
      return DomainEntity.url.apply(null, args);
    }

    /**
     * Creates a CollectionEventTypeName, but first it validates <code>obj</code> to ensure that it has a
     * valid schema.
     *
     * @param {object} [obj={}] - An initialization object whose properties are the same as the members from
     * this class. Objects of this type are usually returned by the server's REST API.
     *
     * @returns {domain.studies.CollectionEventTypeName}
     *
     * @see {@link domain.studies.CollectionEventTypeName.asyncCreate|asyncCreate()} when you need to create
     * a collectionEventType within asynchronous code.
     */
    static create(obj) {
      var validation = EntityInfo.isValid(obj);
      if (!validation.valid) {
        $log.error(validation.message);
        throw new DomainError(validation.message);
      }
      return new CollectionEventTypeName(obj);
    }

    /**
     * Used to list CollectionEventTypeNames.
     *
     * <p>A paged API is used to list studies. See below for more details.</p>
     *
     * @param {object} options - The options to use to list studies.
     *
     * @param {string} [options.filter] The filter to use on collectionEventType names. Default is empty
     * string.
     *
     * @param {string} [options.sort=name] Studies can be sorted by <code>name</code> or by
     *        <code>state</code>. Values other than these two yield an error. Use a minus sign prefix to sort
     *        in descending order.
     *
     * @param {int} [options.page=1] If the total results are longer than limit, then page selects which
     *        studies should be returned. If an invalid value is used then the response is an error.
     *
     * @param {int} [options.limit=10] The total number of studies to return per page. The maximum page size
     *        is 10. If a value larger than 10 is used then the response is an error.
     *
     * @param {Array<domain.EntityInfo>} omit - the list of names to filter out of the result returned
     *        from the server.
     *
     * @returns
     * {Promise<common.controllers.PagedListController.PagedResult<domain.studies.CollectionEventTypeName>>}
     */
    static list(studyId, options, omit) {
      return EntityInfo.list(CollectionEventTypeName.url(studyId), options, omit)
        .then(items => items.map(item => CollectionEventTypeName.create(item)));
    }

  }

  return CollectionEventTypeName;
}

export default ngModule => ngModule.factory('CollectionEventTypeName', CollectionEventTypeNameFactory)

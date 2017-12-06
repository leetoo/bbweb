/**
 * @author Nelson Loyola <loyola@ualberta.ca>
 * @copyright 2015 Canadian BioSample Repository (CBSR)
 */
import _ from 'lodash';
import faker  from 'faker';
import moment from 'moment';

const STRING_SYMBOL                     = Symbol('string'),
      ENTITY_NAME_PROCESSING_TYPE       = Symbol('processingType'),
      ENTITY_NAME_SPECIMEN_LINK_TYPE    = Symbol('specimenLinkType'),
      ENTITY_NAME_COLLECTION_EVENT_TYPE = Symbol('collectionEventType'),
      ENTITY_NAME_SPECIMEN_GROUP        = Symbol('specimenGroup'),
      ENTITY_NAME_ANNOTATION_TYPE       = Symbol('annotationType'),
      ENTITY_NAME_STUDY                 = Symbol('study'),
      ENTITY_NAME_PARTICIPANT           = Symbol('participant'),
      ENTITY_NAME_COLLECTION_EVENT      = Symbol('collectionEvent'),
      ENTITY_NAME_SPECIMEN              = Symbol('specimen'),
      ENTITY_NAME_CENTRE                = Symbol('centre'),
      ENTITY_NAME_LOCATION              = Symbol('location'),
      ENTITY_NAME_SHIPMENT              = Symbol('shipment'),
      ENTITY_NAME_SHIPMENT_SPECIMEN     = Symbol('shipmentSpecimen'),
      ENTITY_NAME_USER                  = Symbol('user'),
      ENTITY_NAME_MEMBERSHIP_BASE       = Symbol('membershipBase'),
      ENTITY_NAME_MEMBERSHIP            = Symbol('membership'),
      ENTITY_NAME_ACCESS_ITEM           = Symbol('accessItem'),
      ENTITY_NAME_ROLE                  = Symbol('role'),
      ENTITY_NAME_PERMISSION            = Symbol('permission')


const defaultEntities = new Map();

  /**
   * Generates a unique name for a domain entity type. If domain entity type is undefined, then a unique
   * string is generated.
   *
   * @param domainEntityType the name of the domain entity type. Eg: 'study', 'centre', 'user', etc.
   */
const domainEntityNameNext = function (domainEntityType = STRING_SYMBOL) {
  return _.uniqueId(domainEntityType.toString() + '_');
}

const stringNext = function () {
  return domainEntityNameNext();
}

const membershipBaseDefaults = function () {
  return Object.assign(
    {
      id:           domainEntityNameNext(ENTITY_NAME_MEMBERSHIP_BASE),
      description:  faker.lorem.sentences(4),
      studyData:    this.entitySet(),
      centreData:   this.entitySet()
    },
    nameAndSlug()
  )
}

const accessItemDefaults = function () {
  return Object.assign(
    {
      id:           domainEntityNameNext(ENTITY_NAME_ACCESS_ITEM),
      description:  faker.lorem.sentences(4),
      parentData:   [ this.entityInfo() ],
      childData:    [ this.entityInfo() ]
    },
    nameAndSlug()
  )
}

// this function taken from here:
// https://gist.github.com/mathewbyrne/1280286
function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, '_') // swap any length of whitespace, underscore, hyphen characters with a single _
    .replace(/^-+|-+$/g, ''); // remove leading, trailing -
}

function nameAndSlug() {
  const name = stringNext()
  return {
    slug: slugify(name),
    name: name
  }
}

function entityNameDto(createFunc, options = {}) {
  const c = createFunc(_.pick(options, ['id', 'name']));
  return _.pick(c, ['id', 'name']);
}

function entityNameAndStateDto(createFunc, options = {}) {
  const c = createFunc(_.pick(options, ['id', 'name', 'state']));
  return _.pick(c, ['id', 'name', 'state']);
}

/*
 * Generates JSON domain entities as if returned by the server.
 *
 * This has to be an AngularJS service so that it's dependencies from the real application
 * can be injected (i.e. AnnotationValueType).
 */
class Factory {

  constructor(AnnotationValueType,
              AnnotationMaxValueCount,
              AnatomicalSourceType,
              PreservationTemperatureType,
              PreservationType,
              SpecimenType,
              StudyState,
              CentreState,
              UserState,
              SpecimenState,
              ShipmentState,
              ShipmentItemState) {

    'ngInject';

    Object.assign(this, {
      AnnotationValueType,
      AnnotationMaxValueCount,
      AnatomicalSourceType,
      PreservationTemperatureType,
      PreservationType,
      SpecimenType,
      StudyState,
      CentreState,
      UserState,
      SpecimenState,
      ShipmentState,
      ShipmentItemState
    });

    this.commonFieldNames = Object.keys(this.commonFields());
  }

  commonFields() {
    return {
      version:      0,
      timeAdded:    moment(faker.date.recent(10)).format(),
      timeModified: moment(faker.date.recent(5)).format()
    };
  }

  stringNext() {
    return domainEntityNameNext();
  }

  emailNext() {
    return faker.internet.email();
  }

  urlNext() {
    return faker.internet.url();
  }

  updateDefaultEntity(entityName, entity) {
    defaultEntities.set(entityName, entity);
  }

  defaultEntity(entityName, createFunc) {
    if (defaultEntities.has(entityName)) {
      return defaultEntities.get(entityName);
    }
    createFunc.call(this);
    if (!defaultEntities.has(entityName)) {
      throw new Error('entity not created: ' + entityName)
    }
    return defaultEntities.get(entityName)
  }

  specimenLinkType(options = {}) {
    const processingType = this.defaultProcessingType(),
          defaults = {
            id:                    domainEntityNameNext(ENTITY_NAME_SPECIMEN_LINK_TYPE),
            processingTypeId:      processingType.id,
            expectedInputChange:   faker.random.number({precision: 0.5}),
            expectedOutputChange:  faker.random.number({precision: 0.5}),
            inputGroupId:          null,
            outputGroupId:         null,
            inputCount:            faker.random.number(5) + 1,
            outputCount:           faker.random.number(5) + 1,
            inputContainerTypeId:  null,
            outputContainerTypeId: null
          },
          validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
          slt = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));

    this.updateDefaultEntity(ENTITY_NAME_SPECIMEN_LINK_TYPE, slt);
    return slt;
  }

  defaultSpecimenLinkType() {
    return this.defaultEntity(ENTITY_NAME_SPECIMEN_LINK_TYPE, this.specimenLinkType);
  }

  processingType(options = {}) {
    var study = this.defaultStudy(),
        defaults = Object.assign(
          {
            id:          domainEntityNameNext(ENTITY_NAME_PROCESSING_TYPE),
            studyId:     study.id,
            description: faker.lorem.sentences(4),
            enabled:     false
          },
          nameAndSlug()
        ),
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        pt = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_PROCESSING_TYPE, pt);
    return pt;
  }

  defaultProcessingType() {
    return this.defaultEntity(ENTITY_NAME_PROCESSING_TYPE, this.processingType);
  }

  /**
   * Returns a collection event type as returned by the server.
   */
  collectionEventType(options = {}) {
    var study = this.defaultStudy(),
        defaults = Object.assign(
          {
            id:                   domainEntityNameNext(ENTITY_NAME_COLLECTION_EVENT_TYPE),
            studyId:              study.id,
            description:          faker.lorem.sentences(4),
            specimenDescriptions: [],
            annotationTypes:      [],
            recurring:            false
          },
          nameAndSlug()
        ),
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        cet = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_COLLECTION_EVENT_TYPE, cet);
    return cet;
  }

  defaultCollectionEventType() {
    return this.defaultEntity(ENTITY_NAME_COLLECTION_EVENT_TYPE, this.collectionEventType);
  }

  randomAnatomicalSourceType() {
    return faker.random.arrayElement(_.values(this.AnatomicalSourceType));
  }

  randomPreservationType() {
    return faker.random.arrayElement(_.values(this.PreservationType));
  }

  randomPreservationTemperatureTypeType() {
    return faker.random.arrayElement(_.values(this.PreservationTemperatureType));
  }

  randomSpecimenType() {
    return faker.random.arrayElement(_.values(this.SpecimenType));
  }

  specimenGroup(options = {}) {
    var study = this.defaultStudy(),
        defaults = Object.assign(
          {
            id:                          domainEntityNameNext(ENTITY_NAME_SPECIMEN_GROUP),
            studyId:                     study.id,
            description:                 faker.lorem.sentences(4),
            units:                       'mL',
            anatomicalSourceType:        this.randomAnatomicalSourceType(),
            preservationType:            this.randomPreservationType(),
            preservationTemperatureType: this.randomPreservationTemperatureTypeType(),
            specimenType:                this.randomSpecimenType()
          },
          nameAndSlug()
        ),
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        sg = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_SPECIMEN_GROUP, sg);
    return sg;
  }

  defaultSpecimenGroup() {
    return this.defaultEntity(ENTITY_NAME_SPECIMEN_GROUP, this.specimenGroup);
  }

  study(options = {}) {
    var defaults = Object.assign({ id:              domainEntityNameNext(ENTITY_NAME_STUDY),
                                   description:     faker.lorem.sentences(4),
                                   annotationTypes: [],
                                   state:           this.StudyState.DISABLED
                                 },
                                 nameAndSlug()
                                ),
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        s = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_STUDY, s);
    return s;
  }

  defaultStudy() {
    return this.defaultEntity(ENTITY_NAME_STUDY, this.study);
  }

  collectionEventTypeNameDto(options = {}) {
    return entityNameDto(this.collectionEventType.bind(this), options)
  }

  studyNameDto(options) {
    return entityNameAndStateDto(this.study.bind(this), options);
  }

  centreNameDto(options) {
    return entityNameAndStateDto(this.centre.bind(this), options);
  }

  userNameDto(options) {
    return entityNameAndStateDto(this.user.bind(this), options);
  }

  roleNameDto(options) {
    return entityNameAndStateDto(this.role.bind(this), options);
  }

  permissionNameDto(options) {
    return entityNameAndStateDto(this.permission.bind(this), options);
  }

  /**
   * If this.defaultStudy has annotation types, then participant will have annotations based on the study's,
   * unless options.annotationTypes is defined.
   */
  participant(options = {}) {
    var study = this.defaultStudy(),
        defaults = {
          id:          domainEntityNameNext(ENTITY_NAME_PARTICIPANT),
          studyId:     study.id,
          uniqueId:    domainEntityNameNext(ENTITY_NAME_PARTICIPANT),
          annotations: []
        },
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        p;

    p = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));

    if (!options.annotations) {
      // assign annotation types
      if (options.annotationTypes) {
        p.annotations = this.annotations(options.annotationTypes);
      } else if (study.annotationTypes) {
        p.annotations = this.annotations(study.annotationTypes);
      }
    }

    this.updateDefaultEntity(ENTITY_NAME_PARTICIPANT, p);
    return p;
  }

  defaultParticipant() {
    return this.defaultEntity(ENTITY_NAME_PARTICIPANT, this.participant);
  }

  collectionEvent(options = {}) {
    var participant = this.defaultParticipant(),
        collectionEventType = this.defaultCollectionEventType(),
        defaults = {
          id:                    domainEntityNameNext(ENTITY_NAME_COLLECTION_EVENT),
          participantId:         participant.id,
          collectionEventType:   collectionEventType,
          collectionEventTypeId: collectionEventType.id,
          timeCompleted:         moment(faker.date.recent(10)).format(),
          visitNumber:           1,
          annotations:           []
        },
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        ce;

    ce = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));

    if (!options.annotations) {
      // assign annotation types
      if (options.annotationTypes) {
        ce.annotations = this.annotations(options.annotationTypes);
      } else if (collectionEventType.annotationTypes) {
        ce.annotations = this.annotations(collectionEventType.annotationTypes);
      }
    }

    this.updateDefaultEntity(ENTITY_NAME_COLLECTION_EVENT, ce);
    return ce;
  }

  defaultCollectionEvent() {
    return this.defaultEntity(ENTITY_NAME_COLLECTION_EVENT, this.collectionEvent);
  }

  centreLocationInfo(centre) {
    if (!centre.locations || (centre.locations.length < 1)) {
      throw new Error('centre does not have any locations');
    }
    return {
      centreId:   centre.id,
      locationId: centre.locations[0].id,
      name:       centre.name +': ' + centre.locations[0].name
    };
  }

  centreLocationDto(centre) {
    if (!centre.locations || (centre.locations.length < 1)) {
      throw new Error('centre does not have any locations');
    }
    return {
      centreId:     centre.id,
      locationId:   centre.locations[0].id,
      centreName:   centre.name,
      locationName: centre.locations[0].name
    };
  }

  specimen(options = {}) {
    var ceventType = this.collectionEventType({ specimenDescriptions: [ this.collectionSpecimenDescription() ] }),
        ctr = this.centre({ locations: [ this.location() ]}),
        defaults = {
          id:                    domainEntityNameNext(ENTITY_NAME_SPECIMEN),
          inventoryId:           domainEntityNameNext(ENTITY_NAME_SPECIMEN),
          specimenDescriptionId: null,
          originLocationInfo:    null,
          locationInfo:          null,
          timeCreated:           moment(faker.date.recent(10)).format(),
          amount:                1,
          state:                 this.SpecimenState.USABLE
        },
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        spc;

    if (ceventType.specimenDescriptions && (ceventType.specimenDescriptions.length > 0)) {
      defaults.specimenDescriptionId = ceventType.specimenDescriptions[0].id;
    }

    if (ctr.locations && (ctr.locations.length > 0)) {
      defaults.originLocationInfo = this.centreLocationInfo(ctr);
      defaults.locationInfo = defaults.originLocationInfo;
    }

    spc = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_SPECIMEN, spc);
    return spc;
  }

  defaultSpecimen() {
    return this.defaultEntity(ENTITY_NAME_SPECIMEN, this.specimen);
  }

  centre(options = {}) {
    var defaults = Object.assign({ id:          domainEntityNameNext(ENTITY_NAME_CENTRE),
                                   description: this.stringNext(),
                                   state:       this.CentreState.DISABLED,
                                   studyNames:  [],
                                   locations:   []
                                 },
                                 nameAndSlug()),
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        c = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_CENTRE, c);
    return c;
  }

  defaultCentre() {
    return this.defaultEntity(ENTITY_NAME_CENTRE, this.centre);
  }

  shipment(options = {}) {
    var loc = this.location(),
        ctr = this.centre({ locations: [ loc ]}),
        locationInfo = {
          centreId: ctr.id,
          locationId: loc.id,
          name: ctr.name + ': ' + loc.name
        },
        defaults = {
          id:               domainEntityNameNext(ENTITY_NAME_SHIPMENT),
          state:            this.ShipmentState.CREATED,
          courierName:      this.stringNext(),
          trackingNumber:   this.stringNext(),
          fromLocationInfo: locationInfo,
          toLocationInfo:   locationInfo,
          specimenCount:    0
        },
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        s = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_SHIPMENT, s);
    return s;
  }

  defaultShipment() {
    return this.defaultEntity(ENTITY_NAME_SHIPMENT, this.shipment);
  }

  shipmentSpecimen(options = {}) {
    var shipment = this.defaultShipment(),
        specimen = this.defaultSpecimen(),
        defaults = { id:           domainEntityNameNext(ENTITY_NAME_SHIPMENT),
                     state:        this.ShipmentItemState.PRESENT,
                     shipmentId:   shipment.id,
                     specimen:     specimen
                   },
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        ss = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_SHIPMENT_SPECIMEN, ss);
    return ss;
  }

  defaultShipmentSpecimen() {
    return this.defaultEntity(ENTITY_NAME_SHIPMENT_SPECIMEN, this.shipment);
  }

  user(options =  { membership: {} }) {
    var defaults = Object.assign({ id:         domainEntityNameNext(ENTITY_NAME_USER),
                                   email:      this.stringNext(),
                                   avatarUrl:  null,
                                   state:      this.UserState.REGISTERED,
                                   roles:      []
                                 },
                                 nameAndSlug()),
        validKeys = this.commonFieldNames.concat(Object.keys(defaults)),
        membership,
        u;

    membership = this.userMembership(options.membership);
    u = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys), { membership: membership });
    this.updateDefaultEntity(ENTITY_NAME_USER, u);
    return u;
  }

  defaultUser() {
    return this.defaultEntity(ENTITY_NAME_USER, this.user);
  }

  /**
   * @param {ValueType} option.valueType the type of annotation Type to create. Valid types are: Text,
   * Number, DateTime and Select.
   *
   * @param {Int} option.maxValueCount when valueType is 'Select', use 1 for single selection or '2' for
   * multiple selection.
   */
  annotationType(options = {}) {
    var defaults = Object.assign({ id:            domainEntityNameNext(ENTITY_NAME_ANNOTATION_TYPE),
                                   description:   null,
                                   valueType:     this.AnnotationValueType.TEXT,
                                   options:       [],
                                   maxValueCount: this.AnnotationMaxValueCount.NONE,
                                   required:      false
                                 },
                                 nameAndSlug()),
        validKeys = Object.keys(defaults),
        at;

    if (!options.valueType) {
      options.valueType = this.AnnotationValueType.TEXT;
    }

    if (options.valueType === this.AnnotationValueType.SELECT) {
      if (_.isUndefined(options.maxValueCount)) {
        options.maxValueCount = this.AnnotationMaxValueCount.SELECT_SINGLE;
      }

      if (_.isUndefined(options.options)) {
        options.options = _.range(2).map(() => domainEntityNameNext(ENTITY_NAME_ANNOTATION_TYPE));
      }
    }

    at = Object.assign(defaults, _.pick(options, validKeys));
    return at;
  }

  allAnnotationTypes() {
    var annotationTypes = _.values(this.AnnotationValueType)
        .map((valueType) => this.annotationType({ valueType: valueType }));
    annotationTypes.push(this.annotationType({
      valueType:     this.AnnotationValueType.SELECT,
      maxValueCount: this.AnnotationMaxValueCount.SELECT_MULTIPLE,
      options:       [ 'opt1', 'opt2', 'opt3' ]
    }));
    return annotationTypes;
  }

  collectionSpecimenDescription(options = {}) {
    var defaults = Object.assign({ id:                          domainEntityNameNext(ENTITY_NAME_SPECIMEN_GROUP),
                                   description:                 faker.lorem.sentences(4),
                                   units:                       'mL',
                                   anatomicalSourceType:        this.randomAnatomicalSourceType(),
                                   preservationType:            this.randomPreservationType(),
                                   preservationTemperatureType: this.randomPreservationTemperatureTypeType(),
                                   specimenType:                this.randomSpecimenType(),
                                   maxCount:                    1,
                                   amount:                      0.5
                                 },
                                 nameAndSlug()),
        validKeys = Object.keys(defaults),
        spec = Object.assign(defaults, _.pick(options, validKeys));
    return spec;
  }

  /**
   * @param options.value The value for the annotation.
   */
  annotation(options = {}, annotationType = {}) {
    var defaults = { annotationTypeId: null,
                     stringValue:      null,
                     numberValue:      null,
                     selectedValues:   []
                   },
        validKeys = Object.keys(defaults),
        annotation = Object.assign(defaults, _.pick(options, validKeys));

    if (annotationType.id) {
      annotation.annotationTypeId = annotationType.id;
    }

    if (!_.isUndefined(options.value) && annotationType.valueType) {
      switch (annotationType.valueType) {
      case this.AnnotationValueType.TEXT:
      case this.AnnotationValueType.DATE_TIME:
        annotation.stringValue = options.value;
        break;

      case this.AnnotationValueType.NUMBER:
        annotation.numberValue = options.value;
        break;

      case this.AnnotationValueType.SELECT:
        if (options.value !== '') {
          if (annotationType.maxValueCount === this.AnnotationMaxValueCount.SELECT_SINGLE) {
            annotation.selectedValues =  [ options.value ];
          } else if (annotationType.maxValueCount === this.AnnotationMaxValueCount.SELECT_MULTIPLE) {
            annotation.selectedValues = options.value;
          } else {
            throw new Error('invalid max value count for annotation: ' + annotationType.maxValueCount);
          }
        }
        break;

      default:
        throw new Error('invalid annotation value type: ' + annotationType.valueType);
      }
    }

    return annotation;
  }

  valueForAnnotation(annotationType) {
    switch (annotationType.valueType) {

    case this.AnnotationValueType.TEXT:
      return this.stringNext();

    case this.AnnotationValueType.NUMBER:
      return faker.random.number({precision: 0.05}).toString();

    case this.AnnotationValueType.DATE_TIME:
      // has to be in UTC format, with no seconds or milliseconds
      return moment(faker.date.past(1))
        .set({
          'millisecond': 0,
          'second':      0
        })
        .utc()
        .format();

    case this.AnnotationValueType.SELECT:
      if (annotationType.maxValueCount === this.AnnotationMaxValueCount.SELECT_SINGLE) {
        return annotationType.options[0];
      } else if (annotationType.maxValueCount === this.AnnotationMaxValueCount.SELECT_MULTIPLE) {
        return annotationType.options;
      } else {
        throw new Error('invalid max value count: ' + annotationType.maxValueCount);
      }
    }

    throw new Error('invalid value type: ' + annotationType.valueType);
  }

  annotations(annotationTypes) {
    return annotationTypes.map((annotationType) => {
      var value = this.valueForAnnotation(annotationType);
      return this.annotation({ value: value }, annotationType);
    });
  }

  /**
   * This is a value object, so it does not have the common fields.
   */
  location(options = {}) {
    var defaults = Object.assign({ id:             domainEntityNameNext(ENTITY_NAME_LOCATION),
                                   street:         faker.address.streetAddress(),
                                   city:           faker.address.city(),
                                   province:       faker.address.state(),
                                   postalCode:     faker.address.zipCode(),
                                   poBoxNumber:    faker.address.zipCode(),
                                   countryIsoCode: faker.address.country()
                                 },
                                 nameAndSlug()),
        validKeys = Object.keys(defaults),
        at = Object.assign(defaults, _.pick(options, validKeys));
    return at;
  }

  centreLocations(centres) {
    return _.flatMap(centres, function (centre) {
      return centre.locations.map((location) => ({
        centreId:     centre.id,
        locationId:   location.id,
        centreName:   centre.name,
        locationName: location.name
      }));
    });
  }

  pagedResult(entities, { maxPages: maxPages = 4} = {}) {
    return {
      items:    entities,
      page:     1,
      offset:   0,
      total:    entities.length,
      limit:    5,
      next:     2,
      maxPages: maxPages
    };
  }

  entityInfo() {
    return {
      id:   this.stringNext(),
      name: this.stringNext()
    };
  }

  entitySet() {
    return { allEntities: false, entityData: [] };
  }

  membershipBase(options = {}) {
    const defaults  = membershipBaseDefaults.call(this),
          validKeys = Object.keys(defaults),
          m         = Object.assign(defaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_MEMBERSHIP_BASE, m);
    return m;
  }

  defaultMembershipBase() {
    return this.defaultEntity(ENTITY_NAME_MEMBERSHIP_BASE, this.membershipBase);
  }

  membership(options = {}) {
    const defaults  =  Object.assign({ userData: [] }, membershipBaseDefaults.call(this)),
          validKeys = Object.keys(defaults),
          m         = Object.assign({}, defaults, this.membershipBase(options), _.pick(options, validKeys))
    this.updateDefaultEntity(ENTITY_NAME_MEMBERSHIP, m);
    return m;
  }

  defaultMembership() {
    return this.defaultEntity(ENTITY_NAME_MEMBERSHIP, this.membership);
  }

  userMembership(options) {
    return this.membershipBase(options);
  }

  accessItem(options = {}) {
    const defaults = accessItemDefaults.call(this),
          validKeys = Object.keys(defaults),
          item      = Object.assign({}, accessItemDefaults, this.commonFields(), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_ACCESS_ITEM, item);
    return item;
  }

  role(options = {}) {
    var defaults  = Object.assign({ userData: [ this.entityInfo() ] }, accessItemDefaults.call(this)),
        validKeys = Object.keys(defaults),
        role      = Object.assign({}, defaults, this.accessItem(options), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_ROLE, role);
    return role;
  }

  defaultRole() {
    return this.defaultEntity(ENTITY_NAME_ROLE, this.role);
  }

  permission(options = {}) {
    var defaults   = accessItemDefaults.call(this),
        validKeys  = Object.keys(defaults),
        permission = Object.assign({}, defaults, this.accessItem(options), _.pick(options, validKeys));
    this.updateDefaultEntity(ENTITY_NAME_PERMISSION, permission);
    return permission;
  }

  defaultPermission() {
    return this.defaultEntity(ENTITY_NAME_PERMISSION, this.permission);
  }

}

export default ngModule => ngModule.service('Factory', Factory)

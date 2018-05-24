package org.biobank.domain.studies

import java.time.OffsetDateTime
import org.biobank.ValidationKey
import org.biobank.domain._
import org.biobank.domain.annotations._
import org.biobank.domain.containers._
import play.api.libs.json._
import scala.util.Try
import scalaz.Scalaz._

/**
 * Predicates that can be used to filter collections of [[ProcessingType]]s.
 *
 */
trait ProcessingTypePredicates extends HasNamePredicates[ProcessingType] {

  type ProcessingTypeFilter = ProcessingType => Boolean

}

trait ProcessingTypeValidations extends StudyValidations {

  case object ProcessingTypeIdRequired extends ValidationKey

  case object ProcessedSpecimenDefinitionIdRequired extends ValidationKey

  case object CollectedSpecimenDefinitionIdRequired extends ValidationKey

  case object ContainerTypeIdRequired extends ValidationKey

  case object SpecimenDefinitionIdRequired extends ValidationKey

  case object InvalidPositiveNumber extends ValidationKey
}

class InputSpecimenDefinitionType(val id: String) extends AnyVal {
  override def toString: String = id
}

sealed trait SpecimenProcessingInfo extends ProcessingTypeValidations {
  import org.biobank.CommonValidations._
  import org.biobank.domain.DomainValidations._

  val expectedChange:       BigDecimal
  val count:                Int
  val containerTypeId:      Option[ContainerTypeId]

  def validate(): DomainValidation[Boolean] = {
    (validatePositiveNumber(expectedChange, InvalidPositiveNumber) |@|
       validatePositiveNumber(count, InvalidPositiveNumber) |@|
       validateIdOption(containerTypeId, ContainerTypeIdRequired)) { case _ => true }

  }
}

/**
 * Defines the input specimen information for a [[domain.studies.ProcessingType]]
 *
 * @param expectedChange The expected amount to be removed from each input. If the value is not required
 * then use a value of zero.
 *
 * @param count The number of expected specimens when the processing is carried out.
 *
 * @param containerTypeId The [[domain.containers.ContainerType ContainerType]] that the input
 * [[domain.participants.Specimen Specimens]] are stored into. This is an optional field.
 *
 * @param definitionType Where the input specimen originates from: one of [[InputSpecimenDefinitionType]].
 *
 * @parma entityId The entity that contains the [[domain.studies.SpecimenDefinition SpecimenDefinition]] the
 * input [[domain.participants.Specimen Specimens]] comes from. Can be either a
 * [[domain.studies.CollectionEventType CollectionEventType]] or a [[domain.studies.ProcessingType
 * ProcessingType]].
 *
 * @param specimenDefinitionId The ID of the input [[domain.studies.SpecimenDefinition SpecimenDefinition]].
 */
final case class InputSpecimenProcessing(expectedChange:       BigDecimal,
                                         count:                Int,
                                         containerTypeId:      Option[ContainerTypeId],
                                         definitionType:       InputSpecimenDefinitionType,
                                         entityId:             IdentifiedDomainObject[_],
                                         specimenDefinitionId: SpecimenDefinitionId)
    extends SpecimenProcessingInfo
    with CollectionEventTypeValidations {

  import org.biobank.CommonValidations._
  import org.biobank.domain.DomainValidations._

  override def validate(): DomainValidation[Boolean] = {
    val idValidationKey: ValidationKey =
      if (definitionType == ProcessingType.collectedDefinition) CollectionEventTypeIdRequired
      else ProcessingTypeIdRequired

    (super.validate |@|
       validateNonEmptyString(entityId.toString, idValidationKey) |@|
       validateId(specimenDefinitionId, SpecimenDefinitionIdRequired)) { case _ => true }
  }

}

/**
 * Defines the output specimen information for a [[domain.studies.ProcessingType]]
 *
 * @param expectedChange The expected amount to be added to each output. If the value is not required
 * then use a value of zero.
 *
 * @param count The number of resulting specimens when the processing is carried out. A value of zero
 * for output count implies that the count is the same as the input count.
 *
 * @param containerTypeId The [[domain.containers.ContainerType ContainerType]] that the output
 * [[domain.participants.Specimen Specimens]] are stored into. This is an optional field.
 *
 * @param specimenDefinition Details for how the processed specimen is derived.
 *
 */
final case class OutputSpecimenProcessing(expectedChange:     BigDecimal,
                                          count:              Int,
                                          containerTypeId:    Option[ContainerTypeId],
                                          specimenDefinition: ProcessedSpecimenDefinition)
    extends SpecimenProcessingInfo {

  override def validate(): DomainValidation[Boolean] = {
    (super.validate |@| ProcessedSpecimenDefinition.validate(specimenDefinition)) { case _ => true }
  }
}

final case class SpecimenProcessing(input: InputSpecimenProcessing, output: OutputSpecimenProcessing) {

  def validate(): DomainValidation[Boolean] = {
    (input.validate |@| output.validate) { case _ => true }
  }
}

/**
 * Records a regularly preformed specimen processing procedure. It defines and allows for recording of
 * procedures performed on different types of [[domain.participants.Specimen Specimens]].
 *
 * For specimen processing to take place, a study must have at least one processing type defined.
 *
 * @param enabled A processing type should have enabled set to `TRUE` when processing of the contained
 * specimen types is taking place. However, throughout the lifetime of the study, it may be decided to stop a
 * processing type in favour of another. In this case enabled is set to `FALSE`.
 *
 * @param specimenProcessing Details for how the processed specimen is derived.
 *
 * @param annotationTypes The [[domain.studies.AnnotationType AnnotationType]]s for recorded for this
 * processing type.
 */
final case class ProcessingType(studyId:            StudyId,
                                id:                 ProcessingTypeId,
                                version:            Long,
                                timeAdded:          OffsetDateTime,
                                timeModified:       Option[OffsetDateTime],
                                slug:               Slug,
                                name:               String,
                                description:        Option[String],
                                enabled:            Boolean,
                                specimenProcessing: SpecimenProcessing,
                                annotationTypes:    Set[AnnotationType])
    extends ConcurrencySafeEntity[ProcessingTypeId]
    with HasUniqueName
    with HasSlug
    with HasOptionalDescription
    with HasStudyId
    with HasAnnotationTypes
    with ProcessingTypeValidations {
  import org.biobank.CommonValidations._
  import org.biobank.domain.DomainValidations._

  /** Used to change the name. */
  def withName(name: String): DomainValidation[ProcessingType] = {
    validateString(name, NameMinLength, InvalidName) map { _ =>
      copy(slug         = Slug(name),
           name         = name,
           version      = version + 1,
           timeModified = Some(OffsetDateTime.now))
    }
  }

  /** Used to change the description. */
  def withDescription(description: Option[String]): DomainValidation[ProcessingType] = {
    validateNonEmptyStringOption(description, InvalidDescription) map { _ =>
      copy(description  = description,
           version      = version + 1,
           timeModified = Some(OffsetDateTime.now))
    }
  }

  /** Used to enable the processing type. */
  def enable(): ProcessingType = {
    copy(enabled      = true,
         version      = version + 1,
         timeModified = Some(OffsetDateTime.now))
  }

  /** Used to disable the processing type. */
  def disable(): ProcessingType = {
    copy(enabled      = false,
         version      = version + 1,
         timeModified = Some(OffsetDateTime.now))
  }

  /** Updates the expected input change. */
  def withExpectedInputChange(change: BigDecimal): DomainValidation[ProcessingType] = {
    validatePositiveNumber(change, InvalidPositiveNumber) map { _ =>
      withInputSpecimenProcessing(specimenProcessing.input.copy(expectedChange = change))
    }
  }

  /** Updates the expected output change. */
  def withExpectedOutputChange(change: BigDecimal): DomainValidation[ProcessingType] = {
    validatePositiveNumber(change, InvalidPositiveNumber) map { _ =>
      withOutputSpecimenProcessing(specimenProcessing.output.copy(expectedChange = change))
    }
  }

  /** Updates the input count. */
  def withInputCount(count: Int): DomainValidation[ProcessingType] = {
    validatePositiveNumber(count, InvalidPositiveNumber) map { _ =>
      withInputSpecimenProcessing(specimenProcessing.input.copy(count = count))
    }
  }

  /** Updates the output count. */
  def withOutputCount(count: Int): DomainValidation[ProcessingType] = {
    validatePositiveNumber(count, InvalidPositiveNumber) map { _ =>
      withOutputSpecimenProcessing(specimenProcessing.output.copy(count = count))
    }
  }

  /** Updates the input container type. */
  def withInputContainerType(containerTypeId: Option[ContainerTypeId])
      : DomainValidation[ProcessingType] = {
    withInputSpecimenProcessing(specimenProcessing.input.copy(containerTypeId = containerTypeId))
      .successNel[String]
  }

  /** Updates the output container type. */
  def withOutputContainerType(containerTypeId: Option[ContainerTypeId])
      : DomainValidation[ProcessingType] = {
    withOutputSpecimenProcessing(specimenProcessing.output.copy(containerTypeId = containerTypeId))
      .successNel[String]
  }

  def withInputSpecimenDefinition(definitionType: InputSpecimenDefinitionType,
                                  id: IdentifiedDomainObject[_],
                                  specimenDefinitionId: SpecimenDefinitionId)
      : DomainValidation[ProcessingType] = {
    val input = specimenProcessing.input.copy(definitionType       = definitionType,
                                              entityId             = id,
                                              specimenDefinitionId = specimenDefinitionId)
    withInputSpecimenProcessing(input).successNel[String]
  }

  def withOutputSpecimenDefinition(specimenDefinition: ProcessedSpecimenDefinition)
      : DomainValidation[ProcessingType] = {
    ProcessedSpecimenDefinition.validate(specimenDefinition).map { sd =>
      val input = specimenProcessing.output.copy(specimenDefinition = specimenDefinition)
      withOutputSpecimenProcessing(input)
    }
  }

  def withAnnotationType(annotationType: AnnotationType): DomainValidation[ProcessingType] = {
    checkAddAnnotationType(annotationType).map { _ =>
      // replaces previous annotation type with same unique id
      val newAnnotationTypes = annotationTypes - annotationType + annotationType
      copy(annotationTypes = newAnnotationTypes,
           version         = version + 1,
           timeModified    = Some(OffsetDateTime.now))
    }
  }

  def removeAnnotationType(annotationTypeId: AnnotationTypeId): DomainValidation[ProcessingType] = {
    checkRemoveAnnotationType(annotationTypeId).map { annotationType =>
      val newAnnotationTypes = annotationTypes - annotationType
      copy(annotationTypes = newAnnotationTypes,
           version         = version + 1,
           timeModified    = Some(OffsetDateTime.now))
    }
  }

  private def withInputSpecimenProcessing(input: InputSpecimenProcessing): ProcessingType = {
    copy(specimenProcessing = specimenProcessing.copy(input = input),
         version            = version + 1,
         timeModified       = Some(OffsetDateTime.now))
  }

  private def withOutputSpecimenProcessing(output: OutputSpecimenProcessing): ProcessingType = {
    copy(specimenProcessing = specimenProcessing.copy(output = output),
         version            = version + 1,
         timeModified       = Some(OffsetDateTime.now))
  }

  override def toString: String =
    s"""|ProcessingType:{
        |  studyId:            $studyId,
        |  id:                 $id,
        |  timeAdded:          $timeAdded,
        |  timeModified:       $timeModified,
        |  version:            $version,
        |  name:               $name,
        |  description:        $description,
        |  enabled:            $enabled,
        |  specimenProcessing: $specimenProcessing,
        |  annotationTypes:    { $annotationTypes }
        |}""".stripMargin
}

object InputSpecimenProcessing {

  implicit val inputSpecimenInfoFormat: Format[InputSpecimenProcessing] = new Format[InputSpecimenProcessing] {

      override def reads(json: JsValue): JsResult[InputSpecimenProcessing] = {
        for {
          expectedChange       <- (json \ "expectedChange").validate[String]
          validExpectedChange  <- {
            Try(BigDecimal(expectedChange)).toOption match {
              case None => JsError("error: could not parse json for 'expectedChange'")
              case Some(value) => JsSuccess(value)
            }
          }
          count                <- (json \ "count").validate[Int]
          containerTypeId      <- (json \ "containerTypeId").validateOpt[ContainerTypeId]
          definitionType       <- (json \ "definitionType").validate[String]
          validDefinitionType  <- {
            definitionType match {
            case ProcessingType.collectedDefinition.id => JsSuccess(ProcessingType.collectedDefinition)
            case ProcessingType.processedDefinition.id => JsSuccess(ProcessingType.processedDefinition)
            case _ => JsError("error: could not parse json to 'definitionType'")
        }
          }
          entityId             <- (json \ "entityId").validate[String]
          specimenDefinitionId <- (json \ "specimenDefinitionId").validate[SpecimenDefinitionId]
        } yield {
          val id: IdentifiedDomainObject[_] =
            if (validDefinitionType == ProcessingType.collectedDefinition) CollectionEventTypeId(entityId)
            else ProcessingTypeId(entityId)
          InputSpecimenProcessing(validExpectedChange,
                            count,
                            containerTypeId,
                            validDefinitionType,
                            id,
                            specimenDefinitionId)
        }
      }

      override def writes(specimenInfo: InputSpecimenProcessing): JsValue =
        Json.obj("expectedChange"       -> specimenInfo.expectedChange.toString,
                 "count"                -> specimenInfo.count,
                 "containerTypeId"      -> specimenInfo.containerTypeId.map(_.id),
                 "definitionType"       -> specimenInfo.definitionType.id,
                 "entityId"             -> specimenInfo.entityId.toString,
                 "specimenDefinitionId" -> specimenInfo.specimenDefinitionId)
    }

}

object OutputSpecimenProcessing {

  implicit val outputSpecimenInfoFormat: Format[OutputSpecimenProcessing] = new Format[OutputSpecimenProcessing] {

      override def reads(json: JsValue): JsResult[OutputSpecimenProcessing] = {
        for {
          expectedChange       <- (json \ "expectedChange").validate[String]
          validExpectedChange  <- {
            Try(BigDecimal(expectedChange)).toOption match {
              case None => JsError("error: could not parse json for 'expectedChange'")
              case Some(value) => JsSuccess(value)
            }
          }
          count                <- (json \ "count").validate[Int]
          containerTypeId      <- (json \ "containerTypeId").validateOpt[ContainerTypeId]
          specimenDefinition   <- (json \ "specimenDefinition").validate[ProcessedSpecimenDefinition]
        } yield {
          OutputSpecimenProcessing(validExpectedChange, count, containerTypeId, specimenDefinition)
        }
      }

      override def writes(specimenInfo: OutputSpecimenProcessing): JsValue =
        Json.obj("expectedChange"     -> specimenInfo.expectedChange.toString,
                 "count"              -> specimenInfo.count,
                 "containerTypeId"    -> specimenInfo.containerTypeId.map(_.id),
                 "specimenDefinition" -> specimenInfo.specimenDefinition)
    }

}

object ProcessingType extends ProcessingTypeValidations {
  import org.biobank.CommonValidations._
  import org.biobank.domain.DomainValidations._

  val collectedDefinition: InputSpecimenDefinitionType = new InputSpecimenDefinitionType("collected")

  val processedDefinition: InputSpecimenDefinitionType = new InputSpecimenDefinitionType("processed")

  implicit val specimenProcessingFormat: Format[SpecimenProcessing] = Json.format[SpecimenProcessing]

  implicit val processingTypeFormat: Format[ProcessingType] =
    Json.format[ProcessingType]

  def create(studyId:            StudyId,
             id:                 ProcessingTypeId,
             version:            Long,
             name:               String,
             description:        Option[String],
             enabled:            Boolean,
             specimenProcessing: SpecimenProcessing,
             annotationTypes:    Set[AnnotationType])
      : DomainValidation[ProcessingType] = {

    (validateId(studyId, StudyIdRequired) |@|
       validateId(id, ProcessingTypeIdRequired) |@|
       validateVersion(version) |@|
       validateNonEmptyString(name, NameRequired) |@|
       validateNonEmptyStringOption(description, InvalidDescription) |@|
       specimenProcessing.validate() |@|
       annotationTypes.toList.traverseU(AnnotationType.validate)) { case _ =>
        ProcessingType(studyId               = studyId,
                       id                    = id,
                       version               = version,
                       timeAdded             = OffsetDateTime.now,
                       timeModified          = None,
                       slug                  = Slug(name),
                       name                  = name,
                       description           = description,
                       enabled               = enabled,
                       specimenProcessing    = specimenProcessing,
                       annotationTypes       = annotationTypes)

    }
  }

  val sort2Compare: Map[String, (ProcessingType, ProcessingType) => Boolean] =
    Map[String, (ProcessingType, ProcessingType) => Boolean]("name"  -> compareByName)

  def compareByName(a: ProcessingType, b: ProcessingType): Boolean =
    (a.name compareToIgnoreCase b.name) < 0
}

package org.biobank.controllers.users

import org.biobank.infrastructure.command.Commands._
import javax.inject.{Inject, Singleton}
import org.biobank.domain.user._
import org.biobank.controllers._
import org.biobank.infrastructure.command.UserCommands._
import org.biobank.service.studies.StudiesService
import org.biobank.service.users.UsersService
import org.biobank.service.{AuthToken, PagedResults}
import play.api.Logger
import play.api.cache.CacheApi
import play.api.libs.json.Reads._
import play.api.libs.json._
import play.api.mvc._
import play.api.{Environment, Logger}
import scala.concurrent.{ExecutionContext, Future}
import scalaz.Scalaz._
import scalaz.Validation.FlatMap._
import scalaz._

@SuppressWarnings(Array("org.wartremover.warts.ImplicitParameter"))
@Singleton
class UsersController @Inject() (val action:         BbwebAction,
                                 val env:            Environment,
                                 val cacheApi:       CacheApi,
                                 val authToken:      AuthToken,
                                 val usersService:   UsersService,
                                 val studiesService: StudiesService)
                             (implicit val ec: ExecutionContext)
    extends CommandController {
  import org.biobank.controllers.Security._

  val log: Logger = Logger(this.getClass)

  private val PageSizeMax = 20

  /** Used for obtaining the email and password from the HTTP login request */
  case class LoginCredentials(email: String, password: String) extends Command

  /** JSON reader for [[LoginCredentials]]. */
  implicit val loginCredentialsReads: Reads[LoginCredentials] = Json.reads[LoginCredentials]

  /**
   * Log-in a user. Expects the credentials in the body in JSON format.
   *
   * Set the cookie [[AuthTokenCookieKey]] to have AngularJS set the X-XSRF-TOKEN in the HTTP
   * header.
   *
   * @return The token needed for subsequent requests
   */
  def login(): Action[JsValue] =
    anonymousCommandAction[LoginCredentials]{ credentials =>
      val v = for {
          user  <- usersService.validatePassword(credentials.email, credentials.password)
          valid <- usersService.allowLogin(user)
        } yield user

      // FIXME: what if user attempts multiple failed logins? lock the account after 3 attempts?
      // how long to lock the account?
      Future {
        v.fold(
          err => Unauthorized,
          user => {
            val token = authToken.newToken(user.id)
            log.debug(s"user logged in: ${user.email}, token: $token")
            Ok(user.toDto).withCookies(Cookie(AuthTokenCookieKey, token, None, httpOnly = false))
          }
        )
      }
    }

  /**
   * Retrieves the user associated with the token, if it is valid.
   */
  def authenticateUser(): Action[Unit] = action(parse.empty) { implicit request =>
      usersService.getUser(request.authInfo.userId).fold(
        err  => Unauthorized,
        user => Ok(user.toDto)
      )
    }

  /**
   * Log-out a user. Invalidates the authentication token.
   *
   * Discard the cookie [[AuthTokenCookieKey]] to have AngularJS no longer set the
   * X-XSRF-TOKEN in HTTP header.
   */
  def logout(): Action[Unit] = action(parse.empty) { implicit request =>
      authToken.removeToken(request.authInfo.token)
      Ok("user has been logged out")
        .discardingCookies(DiscardingCookie(name = AuthTokenCookieKey))
        .withNewSession
    }

  def userCounts(): Action[Unit] =
    action(parse.empty) { implicit request =>
      Ok(usersService.getCountsByStatus)
    }

  def list: Action[Unit] =
    action.async(parse.empty) { implicit request =>
      validationReply(
        Future {
          for {
            pagedQuery <- PagedQuery.create(request.rawQueryString, PageSizeMax)
            users      <- usersService.getUsers(pagedQuery.filter, pagedQuery.sort)
            validPage  <- pagedQuery.validPage(users.size)
            results    <- PagedResults.create(users, pagedQuery.page, pagedQuery.limit)
          } yield results
        }
      )
    }

  /** Retrieves the user for the given id as JSON */
  def user(id: UserId): Action[Unit] = action(parse.empty) { implicit request =>
      validationReply(usersService.getUser(id))
    }

  def registerUser(): Action[JsValue] =
    anonymousCommandAction[RegisterUserCmd]{ cmd =>
      Logger.debug(s"registerUser: cmd: $cmd")
      val future = usersService.register(cmd)
      future.map { validation =>
        validation.fold(
          err   => {
            val errs = err.list.toList.mkString(", ")
            if (errs.contains("exists")) {
              Forbidden("email already registered")
            } else {
              BadRequest(errs)
            }
          },
          user => Ok(user)
        )
      }
    }

  def snapshot: Action[Unit] =
    action.async(parse.empty) { implicit request =>
      usersService.snapshot
      Future.successful(Results.Ok(Json.obj("status" ->"success", "data" -> true)))
    }

  /** Resets the user's password.
   */
  def passwordReset(): Action[JsValue] =
    anonymousCommandAction[ResetUserPasswordCmd]{ cmd =>
      val future = usersService.resetPassword(cmd)
      future.map { validation =>
        validation.fold(
          err   => Unauthorized,
          event => Ok("password has been reset")
        )
      }
    }

  def updateName(id: UserId): Action[JsValue] =
    commandAction[UpdateUserNameCmd](Json.obj("id" -> id))(processCommand)

  def updateEmail(id: UserId): Action[JsValue] =
    commandAction[UpdateUserEmailCmd](Json.obj("id" -> id))(processCommand)

  def updatePassword(id: UserId): Action[JsValue] =
    commandAction[UpdateUserPasswordCmd](Json.obj("id" -> id))(processCommand)

  def updateAvatarUrl(id: UserId): Action[JsValue] =
    commandAction[UpdateUserAvatarUrlCmd](Json.obj("id" -> id))(processCommand)

  def activateUser(id: UserId): Action[JsValue] =
    commandAction[ActivateUserCmd](Json.obj("id" -> id))(processCommand)

  def lockUser(id: UserId): Action[JsValue] =
    commandAction[LockUserCmd](Json.obj("id" -> id))(processCommand)

  def unlockUser(id: UserId): Action[JsValue] =
    commandAction[UnlockUserCmd](Json.obj("id" -> id))(processCommand)

  def userStudies(id:    UserId,
                  query: Option[String],
                  sort:  Option[String],
                  order: Option[String]): Action[Unit] =
    action(parse.empty) { implicit request =>
      // FIXME this should return only the studies this user has access to
      //
      // This this for now, but fix once user access have been implemented
      val studies = studiesService.getStudyCount
      Ok(studies)
    }

  private def processCommand(cmd: UserCommand) = {
    validationReply(usersService.processCommand(cmd))
  }
}

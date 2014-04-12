package org.biobank.controllers

import org.biobank.service.{ ServiceComponent, TopComponentImpl }

import play.api._
import play.api.mvc._
import securesocial.core.SecureSocial

import scalaz._
import Scalaz._

object UserController extends Controller with SecureSocial {

  lazy val userService = WebComponent.userService

  def profile = SecuredAction { implicit request =>
    userService.getByEmail(request.user.email.getOrElse("")) match {
      case Success(user) => Ok(views.html.user.profile())
      case Failure(err) => Forbidden
    }
  }

}
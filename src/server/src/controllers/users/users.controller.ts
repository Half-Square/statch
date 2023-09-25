/******************************************************************************
 * @Author                : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @CreatedDate           : 2023-06-01 15:15:39                               *
 * @LastEditors           : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @LastEditDate          : 2023-09-25 15:52:20                               *
 *****************************************************************************/

/* SUMMARY
  * Imports
  * Services
  * Dto
  * Guards
  * Register new user 
  * Connect user
  * Get user's assignments
*/

/* Imports */
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards
} from "@nestjs/common";
import { sha256 } from "js-sha256";
import * as jwt from "jsonwebtoken";
import { Assignment, User } from "@prisma/client";
/***/

/* Services */
import { PrismaService } from "src/prisma.service";
/***/

/* Dto */
import * as usersDto from "./users.dto";
/***/

/* Guards */
import { IsConnectedGuard } from "src/guards/is-connected.guard";
import { IsSelfGuard } from "src/guards/is-self.guard";
/***/

@Controller("api")
export class UsersController {
  constructor(private prisma: PrismaService) {
  }

  /**
  * Register new user 
  * @param name - User's name
  * @param email - User's email
  * @param password - User's password
  * @returns - New registered user details
  */
  @Post("users")
  async register(@Body() body: usersDto.RegisterInput): Promise<usersDto.DetailsOutput> {
    try {
      let passwd = String(sha256(body.password));
      let count = await (await this.prisma.user.findMany()).length;

      const res = await this.prisma.user.create({
        data: {
          name: body.name,
          password: passwd,
          email: body.email,
          validate: count === 0,
          isAdmin: count === 0 
        }
      });
      return new usersDto.DetailsOutput(res);
    } catch (err) {
      if (err.code == "P2002") {
        throw new HttpException("Email Already Exist", HttpStatus.NOT_ACCEPTABLE);
      } else {
        console.error(`${new Date().toISOString()} - ${err}`);
        throw err;
      }
    }
  }
  /***/

  /**
  * Connect user
  * @param email - User's email
  * @param password - User's password
  * @returns - User connected details
  */
  @Post("login")
  async login(@Body() body: usersDto.ConnectInput): Promise<usersDto.ConnectOutput> {
    try {
      const res = await this.prisma.user.findUnique({where: {email: body.email}});
      if (!res) throw new HttpException("Not Found", HttpStatus.NOT_FOUND);


      if (res.password !== sha256(body.password)) {
        throw new HttpException("Invalid Password", HttpStatus.BAD_REQUEST);
      }

      if (!res.validate) throw new HttpException("Not validate yet", HttpStatus.BAD_REQUEST);

      res["token"] = jwt.sign(res, process.env.SALT, {
        algorithm: "HS256",
        expiresIn: process.env.SESSION_TIME
      });

      return new usersDto.ConnectOutput(res);
    } catch (err) {
      console.error(`${new Date().toISOString()} - ${err}`);
      throw err;
    }
  }
  /***/

  /**
  * Get user's assignments
  * @return - User assignments list
  */
  @Get("/users/:id/assignments")
  @UseGuards(IsConnectedGuard)
  @UseGuards(IsSelfGuard)
  async getAssignments(@Param("id") id: string): Promise<Assignment[]> {
    return await this.prisma.assignment.findMany({where: {userId: id}});
  }
  /***/

  /**
  * Get all users
  * @return - User list 
  */
  @Get("users")
  @UseGuards(IsConnectedGuard)
  async getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  /***/
}

/******************************************************************************
 * @Author                : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @CreatedDate           : 2023-06-24 13:45:04                               *
 * @LastEditors           : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @LastEditDate          : 2023-09-25 13:37:25                               *
 *****************************************************************************/

/* SUMMARY
  * Imports
  * Dto
  * Services
  * Guards
  * Get all tickets
  * Get one ticket by id
  * Create new tasks
  * Update ticket
  * Delete ticket
*/

/* Imports */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards
} from "@nestjs/common";
import { Ticket } from "@prisma/client";
import * as jwt from "jsonwebtoken";
/***/

/* Dto */
import * as ticketsDto from "./tickets.dto";
/***/

/* Services */
import { SocketService } from "src/services/socket/socket.service";
import { PrismaService } from "src/prisma.service";
/***/

/* Guards */
import { IsConnectedGuard } from "src/guards/is-connected.guard";
/***/

@Controller("api")
@UseGuards(IsConnectedGuard)
export class TicketsController {
  constructor(private socket: SocketService,
              private prisma: PrismaService) {
  }

  /**
  * Get all tickets
  * @return - Tickets list 
  */
  @Get("tickets")
  async getAll(): Promise<Ticket[]> {
    try {
      return await this.prisma.ticket.findMany({
        include: {
          labels: true,
          assignments: true
        }
      });
    } catch (err) {
      throw err;
    }
  }
  /***/

  /**
  * Get one ticket by id
  * @param id - Ticket's id to get
  * @return - Ticket's details 
  */
  @Get("tickets/:id")
  async getById(@Param("id") id: string): Promise<Ticket> {
    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: {id: id},
        include: {
          labels: true,
          assignments: true
        }
      });
      if (ticket) return ticket;
      else throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }
  /***/

  /**
  * Create new ticket
  * @param id - task's ID where create ticket
  * @param body - Creation data
  * @returns - Ticket's details
  */
  @Post("tasks/:id/tickets")
  async create(
    @Param("id") id: string,
    @Headers("x-token") token: string,
    @Body() body: ticketsDto.CreateInput,
  ): Promise<Ticket> {
    try {
      const user = jwt.verify(token, process.env.SALT);
      const newTask = await this.prisma.ticket.create({
        data: {
          ...body,
          taskId: id,
          ownerId: user.id,
          assignments: {
            create: [{
              userId: user.id
            }]
          }
        },
        include: {
          labels: true,
          assignments: true
        }
      });

      this.socket.broadcast("tickets", newTask);
      return newTask;
    } catch (err) {
      throw err;
    }
  }
  /***/

  /**
  * Update ticket
  * @param id - ticket's ID to update
  * @param body - Data to update 
  * @returns - Updated ticket's details
  */
  @Put("tickets/:id")
  async update(
    @Param("id") id: string,
    @Body() body: ticketsDto.UpdateInput
  ): Promise<Ticket> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: {id: id},
        data: body,
        include: {
          labels: true,
          assignments: true
        }
      });

      this.socket.broadcast("tickets", ticket);
      return ticket;
    } catch (err) {
      throw err;
    }
  }
  /***/

  /**
  * Delete ticket
  * @param id - Ticket's id to delete
  * @return - Success message 
  */
  @Delete("tickets/:id")
  async deleteById(@Param("id") id: string): Promise<{message: string}> {
    try {
      await this.prisma.ticket.delete({where: {id: id}});
      this.socket.broadcast("tickets", {id: id}, true);

      return {message: `Ticket ${id} deleted`};
    } catch (err) {
      throw err;
    }
  }
  /***/
}

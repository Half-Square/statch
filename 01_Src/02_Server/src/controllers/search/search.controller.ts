/******************************************************************************
 * @Author                : Adrien Lanco<adrienlanco0@gmail.com>              *
 * @CreatedDate           : 2023-03-27 16:56:41                               *
 * @LastEditors           : Adrien Lanco<adrienlanco0@gmail.com>              *
 * @LastEditDate          : 2023-03-30 12:50:10                               *
 *****************************************************************************/

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
  Delete
} from "@nestjs/common";


/* Dto */
import * as searchsDto from "../../dto/searchs.dto";

/* Services */
import {PrismaService} from "../../prisma.service";
/***/

/* Guards */
import { ConnectedGuard } from "../../guards/connected/connected.guard";
import { SearchFilterService } from "./services/search-filter/search-filter.service";
/***/


@Controller('api/search')
export class SearchController {

  constructor(private prisma: PrismaService,
              private searchFilter: SearchFilterService) {}

  /**
  * Connect user
  * @param email - User's email
  * @param password - User's password
  * @returns - User connected details
  */
  @Post("")
  async search(@Body() body: any): Promise<any> {
    try {
      let query = body.query
      let type = ["project", "task", "ticket"];
      let res;
      let response: Array<searchsDto.SearchResponse> = [];

      let wherePTT = { where: { AND: [ { OR: [
                              { id: { contains: query, }},
                              { name: { contains: query, }}
                      ]},  {}] } };
                      
      if (!body.filters) body.filters = {}
      if (!body.selected) body.selected = {}  

      if (body.filters.type) {
        type = body.filters.type;
        delete body.filters.type
      }

      if (body.filters.status) {
        body.filters.status = { in: body.filters.status }
      }

      if (body.filters.level) {
        body.filters.level = { in: body.filters.level }
        type.map((t, i) => { if (t == "project") type.splice(i, 1)})
      }

      if (body.filters.labels) {
        body.filters.labels = { hasEvery: body.filters.labels }
      }
      
      let projectFilters = structuredClone(body.filters);
      let taskFilters = structuredClone(body.filters);
      let ticketFilters = structuredClone(body.filters);
      
      if (body.filters.version) {
        projectFilters.actualVersion = projectFilters.version.name;
        delete projectFilters.version;
        taskFilters.targetVersion = taskFilters.version;
        delete taskFilters.version;
        ticketFilters.targetVersion = ticketFilters.version;
        delete ticketFilters.version;
      }

      if (body.selected.projectId) {
        taskFilters.projectId = body.selected.projectId;
        if (!body.selected.taskId) {
          let proj = await this.prisma.project.findUnique({where: {id: body.selected.projectId}, include: { tasks: true } });
          if (proj.tasks) {
            let tasksIds = [];
            proj.tasks.map((task) => { tasksIds.push(task.id) })
            ticketFilters.taskId = { in: tasksIds }
          }
        }
      }
            
      if (body.selected.taskId) { ticketFilters.taskId = body.selected.taskId }

      if ((!type || type.includes("project")) && !body.selected.projectId && !body.selected.taskId) {
        let where = wherePTT
        where.where.AND[1] = projectFilters;
        res = await this.prisma.project.findMany(where);
        res.map((el) => { response.push(new searchsDto.ProjectOutput(el))});
      }

      if ((!type || type.includes("task")) && !body.selected.taskId) {
        let where = wherePTT
        where.where.AND[1] = taskFilters;
        res = await this.prisma.task.findMany(where);
        res.map((el) => { response.push(new searchsDto.TaskOutput(el))});
      }

      if (!type ||  type.includes("ticket")) {
        let where = wherePTT
        where.where.AND[1] = ticketFilters;
        res = await this.prisma.ticket.findMany(where);
        res.map((el) => { response.push(new searchsDto.TicketOutput(el))});
      }

      return response;
    } catch (err) {
      console.error(`${new Date().toISOString()} - ${err}`);
      throw err;
    }
  }
  /***/
}

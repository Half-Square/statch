/******************************************************************************
 * @Author                : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @CreatedDate           : 2024-01-12 11:37:38                               *
 * @LastEditors           : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @LastEditDate          : 2024-01-12 15:13:01                               *
 *****************************************************************************/

/* SUMMARY
  * Imports
  * Services
  * Guards
  * Interfaces
  * Get stats for project
*/

/* Imports */
import {
  Controller,
  Get,
  Param,
  UseGuards
} from "@nestjs/common";
/***/

/* Services */
import { StatsService } from "./stats.service";
/***/

/* Guards */
import { IsConnectedGuard } from "src/guards/is-connected.guard";
/***/

/* Interfaces */
interface IStats {
  tasks: {
    total: number,
    status: {name: string, nb: number}[],
    owners: {id: string, nb: number}[],
    newByMonth: {year: number, tasks: number[]}[]
  }
}
/***/

@Controller("api")
@UseGuards(IsConnectedGuard)
export class StatsController {
  constructor(private stats: StatsService) {
  }

  /**
  * Get stats for project
  * @param id - Projet id 
  * @return - Stats for project
  */
  @Get("projects/:id/stats")
  async getProjectStats(@Param("id") id: string): Promise<IStats> {
    return {
      tasks: {
        total: await this.stats.nbTasks(id),
        status: await this.stats.nbTasksStatus(id),
        owners: await this.stats.nbTasksOwner(id),
        newByMonth: await this.stats.nbNewTasksByMonth(id)
      }
    };
  }
  /***/
}

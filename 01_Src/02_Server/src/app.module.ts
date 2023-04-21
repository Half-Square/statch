/******************************************************************************
 * @Author                : Adrien Lanco<adrienlanco0@gmail.com>              *
 * @CreatedDate           : 2023-02-21 14:10:37                               *
 * @LastEditors           : Adrien Lanco<adrienlanco0@gmail.com>              *
 * @LastEditDate          : 2023-04-14 14:36:56                               *
 *****************************************************************************/

/* SUMMARY
  * Imports
*/

/* Imports */
import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {PrismaService} from "./prisma.service";
import {ProjectsController} from "./controllers/projects/projects.controller";
import {TasksController} from "./controllers/tasks/tasks.controller";
import {CommentsController} from "./controllers/comments/comments.controller";
import {TicketsController} from "./controllers/tickets/tickets.controller";
import { AuthController } from "./controllers/auth/auth.controller";
import { VersionsController } from './controllers/versions/versions.controller';
import { SearchController } from './controllers/search/search.controller';
import { SearchFilterService } from './controllers/search/services/search-filter/search-filter.service';
import { AssignmentsController } from './controllers/assignments/assignments.controller';
import { LabelsController } from './controllers/labels/labels.controller';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ActivityService } from './services/activity/activity.service';
/***/

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'statch'),
    }),
  ],
  controllers: [
    AppController,
    ProjectsController,
    TasksController,
    CommentsController,
    TicketsController,
    AuthController,
    VersionsController,
    SearchController,
    AssignmentsController,
    LabelsController
  ],
  providers: [PrismaService, SearchFilterService, ActivityService]
})
export class AppModule {}

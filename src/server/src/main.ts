/******************************************************************************
 * @Author                : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @CreatedDate           : 2023-05-30 12:09:38                               *
 * @LastEditors           : Jbristhuille<jean-baptiste@halfsquare.fr>         *
 * @LastEditDate          : 2023-10-05 20:50:41                               *
 *****************************************************************************/

/* SUMMARY
  * Imports
*/

/* Imports */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
/***/

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.enableCors();

  await app.listen(Number(process.env.PORT)); // Start API server
  Logger.log(`Server start on port ${process.env.PORT}`);
}
bootstrap();

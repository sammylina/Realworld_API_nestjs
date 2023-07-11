import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory, PartialGraphHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
const fs = require('fs')

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {abortOnError: false});
  
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
          const firstKey =  Object.keys(errors[0].constraints)[0]
          const result = {errors: [errors[0].constraints[firstKey]]}
          return new BadRequestException(result)
      },
      stopAtFirstError: true
    })
  )

  app.setGlobalPrefix('api')

  const docConfig = new DocumentBuilder()
    .setTitle('Real world API')  
    .setDescription('real world medium clone app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const options: SwaggerDocumentOptions = {
      operationIdFactory(controllerKey, methodKey) {
        return methodKey
      },
    }

  const document = SwaggerModule.createDocument(app, docConfig, options)
  SwaggerModule.setup('/docs', app, document)


  await app.listen(3000)
}
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '')
  process.exit(1)
});















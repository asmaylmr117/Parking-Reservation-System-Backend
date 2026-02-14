import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Use WebSocket adapter
  app.useWebSocketAdapter(new WsAdapter(app));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix(process.env.BASE_PATH || '/api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Parking backend NestJS listening on http://localhost:${port}${process.env.BASE_PATH || '/api/v1'}`);
}

// For Vercel serverless
if (process.env.VERCEL) {
  bootstrap();
} else {
  bootstrap();
}

export default bootstrap;
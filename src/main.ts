import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get ConfigService from the app context
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('PORT') || '4000';

  // Enable HTTP request logging with colors
  morgan.token('colorStatus', (req, res) => {
    const status = res.statusCode;
    const color = status >= 500 ? 31 // red
      : status >= 400 ? 33 // yellow
      : status >= 300 ? 36 // cyan
      : status >= 200 ? 32 // green
      : 0; // no color
    return `\x1b[${color}m${status}\x1b[0m`;
  });

  morgan.token('colorMethod', (req) => {
    const method = req.method;
    const color = method === 'GET' ? 32 // green
      : method === 'POST' ? 34 // blue
      : method === 'PUT' ? 33 // yellow
      : method === 'PATCH' ? 35 // magenta
      : method === 'DELETE' ? 31 // red
      : 0; // no color
    return `\x1b[${color}m${method}\x1b[0m`;
  });

  app.use(morgan(':colorMethod :url :colorStatus :res[content-length] - :response-time ms'));

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Candle Shop API')
    .setDescription('A comprehensive REST API for managing candles in our online candle shop. This API allows you to create, read, update, and delete candles, manage inventory, and filter products by various criteria.')
    .setVersion('1.0')
    .addTag('candles', 'Candle management operations - Create, read, update, delete candles and manage inventory')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:4000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Candle Shop API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper img { content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkY2QjM1Ii8+Cjwvc3ZnPgo='); }
      .swagger-ui .topbar { background-color:rgb(167, 168, 255); }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  console.log(PORT);

  await app.listen(PORT);
  console.log(`  Candle Shop API is running on: http://localhost:${PORT}`);
  console.log(`  API Documentation available at: http://localhost:${PORT}/api`);
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});

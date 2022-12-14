import {
  CREDENTIALS,
  LOG_FORMAT,
  NODE_ENV,
  ORIGIN,
  PORT,
  REDISCLOUD_URL,
  SECRET_KEY,
} from '@config'
import errorMiddleware from '@middlewares/error.middleware'
import { logger, stream } from '@utils/logger'
import { defaultMetadataStorage } from 'class-transformer'
import { validationMetadatasToSchemas } from 'class-validator-jsonschema'
import compression from 'compression'
import redisSessionConnect from 'connect-redis'
import cookieParser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import hpp from 'hpp'
import Redis from 'ioredis'
import morgan from 'morgan'
import 'reflect-metadata'
import { getMetadataArgsStorage, useExpressServer } from 'routing-controllers'
import { routingControllersToSpec } from 'routing-controllers-openapi'
import swaggerUi from 'swagger-ui-express'

const RedisStore = redisSessionConnect(session)

class App {
  public app: express.Application
  public env: string
  public port: string | number
  public redisClient: Redis

  constructor(Controllers: Function[]) {
    this.app = express()
    this.env = NODE_ENV || 'development'
    this.port = PORT || 3000

    this.initializeRedis()
    this.initializeMiddlewares()
    this.initializeRoutes(Controllers)
    this.initializeSwagger(Controllers)
    this.initializeErrorHandling()
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`)
      logger.info(`======= ENV: ${this.env} =======`)
      logger.info(`🚀 App listening on the port ${this.port}`)
      logger.info(`=================================`)
    })
  }

  public getServer() {
    return this.app
  }

  private initializeRedis() {
    this.redisClient = new Redis(REDISCLOUD_URL)
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
    this.app.use(
      session({
        store: NODE_ENV === 'production' && new RedisStore({ client: this.redisClient }),
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: 5 * 60 * 1000,
        },
      }),
    )
  }

  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
      },
      controllers: controllers,
      defaultErrorHandler: false,
    })
  }

  private initializeSwagger(controllers: Function[]) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    })

    const routingControllersOptions = {
      controllers: controllers,
    }

    const storage = getMetadataArgsStorage()
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http',
          },
        },
      },
      info: {
        description: 'Generated with `routing-controllers-openapi`',
        title: 'A sample API',
        version: '1.0.0',
      },
    })

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }
}

export default App

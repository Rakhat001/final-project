import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { EventsModule } from './events/events.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { S3Module } from './s3/s3.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: any) => {
              const { connectionParams, extra } = context;
              const authHeader = connectionParams?.Authorization || connectionParams?.authorization;
              if (!authHeader) {
                console.log('WebSocket connection: No token provided');
                return;
              }
              try {
                const token = authHeader.replace('Bearer ', '');
                const jwtService = new JwtService({
                  secret: configService.get<string>('JWT_SECRET'),
                });

                const payload = jwtService.verify(token);
                
                extra.user = {
                  id: payload.sub,
                  email: payload.email,
                };
                
                console.log(`WebSocket authenticated for user: ${payload.email}`);
              } catch (error) {
                console.error('WebSocket authentication failed:', error.message);
              }
            },
          },
        },
        context: ({ req, res, extra, connection }) => {
          if (req) {
            return { req, res };
          }
          if (extra?.user) {
            return { user: extra.user };
          }
          return {};
        },
      }),
    }),
    UsersModule,
    EventsModule,
    AuthModule,
    S3Module,
    PubSubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

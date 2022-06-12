import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async () => {
    var dbConfig = {
      synchronize: false,
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    };

    switch (process.env.NODE_ENV) {
      case 'development':
        Object.assign(dbConfig, {
          type: 'sqlite',
          database: 'db.sqlite',
        });
        break;
      case 'test':
        Object.assign(dbConfig, {
          type: 'sqlite',
          database: 'test.sqlite',
          migrationsRun: true,
        });
        break;
      case 'production':
        Object.assign(dbConfig, {
          type: 'postgres',
          database: process.env.DATABASE_URL,
          migrationsRun: true,
          ssl: {
            rejectUnauthorized: false,
          },
        });
        break;
      default:
        throw new Error('unknown environment');
    }

    return dbConfig;
  },
};

export const getOrmConfig = () => {
  const dbConfig = {
    synchronize: false,
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    type: '',
    database: '',
    migrationsRun: false,
  };

  switch (process.env.NODE_ENV) {
    case 'development':
      dbConfig.type = 'sqlite';
      dbConfig.database = 'db.sqlite';
      break;
    case 'test':
      dbConfig.type = 'sqlite';
      dbConfig.database = 'test.sqlite';
      dbConfig.migrationsRun = true;
      break;
    case 'production':
      dbConfig.type = 'postgres';
      dbConfig.database = process.env.DATABASE_URL;
      dbConfig.migrationsRun = true;
      Object.assign(dbConfig, {
        ssl: {
          rejectUnauthorized: false,
        },
      });
      break;
    default:
      throw new Error('unknown environment');
  }

  return dbConfig;
};

import { DataSource } from 'typeorm';
import { getOrmConfig } from './typeorm.config';

const config = getOrmConfig();

// @ts-ignore
const source = new DataSource(config);
export default source;

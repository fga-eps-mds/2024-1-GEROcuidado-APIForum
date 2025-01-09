import { AppDataSource } from './src/data-source';

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source initialized');
    await AppDataSource.runMigrations();
    console.log('Migrations executed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during migration run', err);
    process.exit(1);
  });

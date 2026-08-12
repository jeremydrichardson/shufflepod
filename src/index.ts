import express from 'express';
import routes from './routes';
import { config } from './config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

if (require.main === module) {
  app.listen(config.port, config.host, () => {
    console.log(`${config.appName} v0.1.0`);
    console.log(`Server running at http://${config.host}:${config.port}`);
    console.log(`Base URL: ${config.baseUrl}`);
  });
}

export default app;

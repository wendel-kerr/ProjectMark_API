import { env } from './config/env';



import app from './app';
const port = env.PORT;
app.listen(port, () => console.log(`KB API on http://localhost:${env.PORT}`));
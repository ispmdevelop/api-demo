import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const port: Number | String = process.env.PORT || 3000;
app.listen(port, (): void => console.log(`running on port ${port}`));

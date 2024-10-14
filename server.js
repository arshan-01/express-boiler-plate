import connectDB from './src/config/db.config.js';  // Adjust the path as needed
import { app } from './app.js';
import { PORT } from './src/config/env.config.js';

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line
      console.log(`⚙️ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
     // eslint-disable-next-line
    console.log('MongoDB connection failed!', err); 
  });

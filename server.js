import connectDB from './src/config/db.config.js';  // Adjust the path as needed
import { app } from './app.js';

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      // eslint-disable-next-line
      console.log(`⚙️ Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
     // eslint-disable-next-line
    console.log('MongoDB connection failed!', err); 
  });

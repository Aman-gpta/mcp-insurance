const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file in the 'backend' directory
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') }); 
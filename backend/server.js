import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT , ()=> {
            console.log(`Backend Running on PORT ${PORT}`);
        });
    } catch (err) {
        console.log(`Failed to start Server` , err.message);
        process.exit(1);
    }
}

startServer();
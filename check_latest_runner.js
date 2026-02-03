import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Runner from './models/Runner.js';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const latestRunner = await Runner.findOne().sort({ registration_date: -1 });
        if (latestRunner) {
            console.log('Latest Runner:', {
                name: `${latestRunner.first_name} ${latestRunner.last_name}`,
                id_proof_path: latestRunner.id_proof_path,
                registration_date: latestRunner.registration_date
            });
        } else {
            console.log('No runners found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkDb();

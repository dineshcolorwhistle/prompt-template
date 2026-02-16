const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path as needed
const bcrypt = require('bcrypt');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        const adminUser = {
            name: 'Dinesh',
            email: 'dinesh.colorwhistle@gmail.com',
            password: 'admin@#12312',
            role: 'Admin',
        };

        // Check if user exists
        const userExists = await User.findOne({ email: adminUser.email });

        if (userExists) {
            console.log('Admin user already exists');
            // Verify password matches if needed, but for now just exit or update
            // Updating password if user requests logic changes would go here
            // But typically seeders respect existing data unless force flag used
        } else {
            // Hash password here or rely on pre-save hook?
            // If create uses save(), pre-save hook works.
            // User.create() triggers 'save' middleware in Mongoose 5+.
            // Mongoose 6+ also triggers it.
            // But to be explicit and safe with bulk operations (like insertMany which doesn't trigger hooks), 
            // I should hash manually if using insertMany.
            // Using `new User(adminUser).save()` is safest for hooks.

            const user = new User(adminUser);

            // The pre-save hook in User.js handles hashing

            await user.save();
            console.log('Admin user created');
        }

        console.log('Seeder completed');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();

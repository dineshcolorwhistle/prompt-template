const mongoose = require('mongoose');
const Industry = require('./models/Industry');
require('dotenv').config();

console.log("Testing Industry Model Connection...");

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            const count = await Industry.countDocuments({});
            console.log('Industry count:', count);

            const industries = await Industry.find({}).limit(5);
            console.log('Sample Industries:', industries);

        } catch (e) {
            console.error('Error querying industries:', e);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });

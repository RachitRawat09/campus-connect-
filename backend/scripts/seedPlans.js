const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const plans = [
  {
    name: 'free',
    price: 0,
    listingLimit: 3,
    durationDays: null,
    description: 'List up to 3 items for free.'
  },
  {
    name: 'standard',
    price: 5,
    listingLimit: 15,
    durationDays: 30,
    description: 'List up to 15 items for 30 days.'
  },
  {
    name: 'premium',
    price: 10,
    listingLimit: 50,
    durationDays: 30,
    description: 'List up to 50 items for 30 days.'
  },
  {
    name: 'pro',
    price: 20,
    listingLimit: 200,
    durationDays: 30,
    description: 'List up to 200 items for 30 days. Best for power sellers!'
  }
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/your_db_name'); // Change to your DB name
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log('Plans seeded!');
  mongoose.disconnect();
}

seed(); 
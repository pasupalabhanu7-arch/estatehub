// Run with: npm run seed   (wipes users, properties, inquiries and inserts demo data)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Inquiry = require('./models/Inquiry');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Property.deleteMany(), Inquiry.deleteMany()]);

  // User.create runs the password-hash hook (insertMany would not)
  const admin = await User.create({ name: 'Admin', email: 'admin@estatehub.com', password: 'admin123', role: 'admin' });
  const owner1 = await User.create({ name: 'Ravi Kumar', email: 'owner@estatehub.com', password: 'owner123', role: 'owner', phone: '9876543210' });
  const owner2 = await User.create({ name: 'Anita Sharma', email: 'anita@estatehub.com', password: 'owner123', role: 'owner', phone: '9123456780' });
  await User.create({ name: 'Buyer Demo', email: 'buyer@estatehub.com', password: 'buyer123', role: 'buyer' });

  const p = (owner, title, listingType, propertyType, price, bedrooms, bathrooms, area, city, state, address, images, status = 'available') => ({
    owner: owner._id, title, listingType, propertyType, price, bedrooms, bathrooms, area, status,
    description: `${title}. Well maintained property in a prime location of ${city} with great connectivity, nearby schools, markets and hospitals. Ready to move in.`,
    location: { city, state, address },
    images,
  });

  await Property.insertMany([
    p(owner1, '3BHK Luxury Apartment', 'sale', 'apartment', 8500000, 3, 3, 1650, 'Hyderabad', 'Telangana', 'Gachibowli', [img('photo-1545324418-cc1a3fa10c00')]),
    p(owner1, 'Modern Villa with Garden', 'sale', 'villa', 22000000, 4, 4, 3200, 'Hyderabad', 'Telangana', 'Jubilee Hills', [img('photo-1613490493576-7fde63acd811')]),
    p(owner1, '2BHK Flat near Metro', 'rent', 'apartment', 24000, 2, 2, 1100, 'Bengaluru', 'Karnataka', 'Whitefield', [img('photo-1522708323590-d24dbb6b0267')]),
    p(owner1, 'Cozy 1BHK Studio', 'rent', 'apartment', 14000, 1, 1, 620, 'Pune', 'Maharashtra', 'Hinjewadi', [img('photo-1502672260266-1c1ef2d93688')]),
    p(owner1, 'Independent House', 'sale', 'house', 12500000, 4, 3, 2400, 'Chennai', 'Tamil Nadu', 'Adyar', [img('photo-1568605114967-8130f3a36994')]),
    p(owner2, 'Residential Plot 200 sq yd', 'sale', 'plot', 4500000, 0, 0, 1800, 'Vijayawada', 'Andhra Pradesh', 'Benz Circle', [img('photo-1500382017468-9049fed747ef')]),
    p(owner2, 'Commercial Office Space', 'rent', 'commercial', 85000, 0, 2, 2000, 'Mumbai', 'Maharashtra', 'Andheri East', [img('photo-1497366216548-37526070297c')]),
    p(owner2, 'Sea View 3BHK', 'sale', 'apartment', 32000000, 3, 3, 1900, 'Mumbai', 'Maharashtra', 'Worli', [img('photo-1512917774080-9991f1c4c750')]),
    p(owner2, 'Family Home with Terrace', 'rent', 'house', 38000, 3, 2, 1800, 'Hyderabad', 'Telangana', 'Kondapur', [img('photo-1564013799919-ab600027ffc6')]),
    p(owner2, '2BHK Gated Community Flat', 'sale', 'apartment', 6200000, 2, 2, 1250, 'Bengaluru', 'Karnataka', 'Electronic City', [img('photo-1493809842364-78817add7ffb')], 'sold'),
    p(owner1, 'Budget 2BHK for Rent', 'rent', 'apartment', 16000, 2, 1, 900, 'Vijayawada', 'Andhra Pradesh', 'Labbipet', [img('photo-1560448204-e02f11c3d0e2')], 'rented'),
    p(owner1, 'Premium Penthouse', 'sale', 'apartment', 45000000, 4, 5, 4000, 'Chennai', 'Tamil Nadu', 'Nungambakkam', [img('photo-1600596542815-ffad4c1539a9')]),
  ]);

  console.log('Seeded. Logins:');
  console.log('  admin@estatehub.com / admin123  (admin)');
  console.log('  owner@estatehub.com / owner123  (owner)');
  console.log('  anita@estatehub.com / owner123  (owner)');
  console.log('  buyer@estatehub.com / buyer123  (buyer)');
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

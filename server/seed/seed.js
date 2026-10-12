// npm run seed: clears all six collections and fills them with sample data.
// Every date is counted back from the day the seed runs, so the demo cases
// (overdue, due soon, flagged fill-up, registration due) appear on any day.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Expense from '../models/Expense.js';
import FuelLog from '../models/FuelLog.js';
import Owner from '../models/Owner.js';
import ServiceLog from '../models/ServiceLog.js';
import ServiceType from '../models/ServiceType.js';
import Vehicle from '../models/Vehicle.js';
import { addDays, startOfDayUtc } from '../services/dates.js';

const HISTORY_DAYS = 180; // each vehicle's history starts this many days ago
const PARTIAL_FILL_LITERS = 10;
const today = startOfDayUtc();

const daysAgo = (days) => addDays(today, -days);
const roundTo2 = (value) => Math.round(value * 100) / 100;

// D1: 1 = January ... 9 = September, 0 = October. No digit means November or December.
function plateDigitForMonth(month) {
  if (month <= 9) return String(month);
  if (month === 10) return '0';
  return null;
}

// A plate digit that makes a registration due this month, or else next month
const thisMonth = today.getUTCMonth() + 1;
const nextMonth = thisMonth === 12 ? 1 : thisMonth + 1;
const dueDigit = plateDigitForMonth(thisMonth) ?? plateDigitForMonth(nextMonth) ?? '1';

const owners = [
  { key: 'juan', fullName: 'Juan Dela Cruz', email: 'juan.delacruz@example.com', contactNumber: '09170000001', type: 'individual' },
  { key: 'maria', fullName: 'Maria Santos', contactNumber: '09180000002', type: 'individual' },
  { key: 'fleet', fullName: 'Sample Delivery Co.', email: 'fleet@example.com', contactNumber: '09190000003', type: 'business' },
];

const serviceTypes = [
  { name: 'Change oil', intervalKm: 5000, intervalMonths: 6, appliesTo: ['motorcycle', 'car', 'suv', 'van', 'truck'] },
  { name: 'Tire rotation', intervalKm: 10000, intervalMonths: 0, appliesTo: ['car', 'suv', 'van', 'truck'] },
  { name: 'Brake check', intervalKm: 10000, intervalMonths: 12, appliesTo: ['motorcycle', 'car', 'suv', 'van', 'truck'] },
  { name: 'Air filter replacement', intervalKm: 15000, intervalMonths: 24, appliesTo: ['motorcycle', 'car', 'suv', 'van', 'truck'] },
];

// Each vehicle drives kmPerDay every day of its history and fills up every fillEveryDays.
// Its odometer on any day comes from that, so every log is in the right order (D5).
// The comments give the status each service is expected to have.
const vehicles = [
  {
    owner: 'juan', plateNumber: `NDA 451${dueDigit}`, make: 'Toyota', model: 'Vios', year: 2019,
    type: 'car', fuelType: 'gasoline', status: 'active',
    startingOdometer: 45000, kmPerDay: 40, kmPerLiter: 13, fillEveryDays: 10, pricePerLiter: 63.5,
    partialFillDaysAgo: 95,
    services: [
      { name: 'Tire rotation', daysAgo: 170, cost: 600, shop: 'Dealer service center' }, // ok
      { name: 'Change oil', daysAgo: 120, cost: 2800, shop: 'Dealer service center' }, // due soon: 200 km left
      { name: 'Brake check', daysAgo: 30, cost: 900, shop: 'Dealer service center' }, // ok
    ],
    expenses: [
      { category: 'registration', daysAgo: 150, amount: 2500 },
      { category: 'insurance', daysAgo: 150, amount: 6500 },
      { category: 'parking', daysAgo: 20, amount: 120 },
      { category: 'toll', daysAgo: 10, amount: 245 },
      { category: 'wash', daysAgo: 5, amount: 200 },
    ],
  },
  {
    owner: 'juan', plateNumber: '731 HJK', make: 'Honda', model: 'Click 125i', year: 2022,
    type: 'motorcycle', fuelType: 'gasoline', status: 'active',
    startingOdometer: 8000, kmPerDay: 30, kmPerLiter: 45, fillEveryDays: 7, pricePerLiter: 63.5,
    services: [
      { name: 'Change oil', daysAgo: 175, cost: 450, shop: 'Neighborhood motor shop' }, // overdue: 100 km past
      { name: 'Brake check', daysAgo: 90, cost: 350, shop: 'Neighborhood motor shop' }, // ok
    ],
    expenses: [
      { category: 'registration', daysAgo: 100, amount: 1200 },
      { category: 'wash', daysAgo: 15, amount: 80 },
    ],
  },
  {
    owner: 'maria', plateNumber: 'ZTE 7712', make: 'Honda', model: 'City', year: 2018,
    type: 'car', fuelType: 'gasoline', status: 'active',
    startingOdometer: 20000, kmPerDay: 15, kmPerLiter: 14, fillEveryDays: 14, pricePerLiter: 64,
    services: [
      { name: 'Change oil', daysAgo: 178, cost: 2600, shop: 'Dealer service center' }, // due soon: 6 months almost up
      { name: 'Brake check', daysAgo: 60, cost: 900, shop: 'Dealer service center' }, // ok
    ],
    expenses: [
      { category: 'insurance', daysAgo: 90, amount: 7200 },
      { category: 'parking', daysAgo: 8, amount: 60 },
    ],
  },
  {
    owner: 'maria', plateNumber: '455 QWE', make: 'Yamaha', model: 'NMAX', year: 2021,
    type: 'motorcycle', fuelType: 'gasoline', status: 'in_shop',
    startingOdometer: 5000, kmPerDay: 35, kmPerLiter: 38, fillEveryDays: 10, pricePerLiter: 63.5,
    services: [
      { name: 'Change oil', daysAgo: 175, cost: 500, shop: 'Neighborhood motor shop' }, // overdue, but in the shop
      { name: 'Brake check', daysAgo: 120, cost: 350, shop: 'Neighborhood motor shop' },
      { name: 'Brake check', daysAgo: 0, cost: 350, shop: 'Neighborhood motor shop' }, // done today in the shop
    ],
    expenses: [{ category: 'parts', daysAgo: 3, amount: 3500 }],
  },
  {
    owner: 'fleet', plateNumber: '602 MPF', make: 'Honda', model: 'TMX 125 Alpha', year: 2023,
    type: 'motorcycle', fuelType: 'gasoline', status: 'active',
    startingOdometer: 15000, kmPerDay: 80, kmPerLiter: 50, fillEveryDays: 6, pricePerLiter: 63.5,
    flaggedFillDaysAgo: 60, // one thirsty fill-up: 1.5 times the usual liters (D8 flag)
    services: [
      { name: 'Air filter replacement', daysAgo: 170, cost: 300, shop: 'Fleet garage' }, // ok
      { name: 'Change oil', daysAgo: 110, cost: 450, shop: 'Fleet garage' },
      { name: 'Brake check', daysAgo: 100, cost: 350, shop: 'Fleet garage' }, // ok
      { name: 'Change oil', daysAgo: 50, cost: 450, shop: 'Fleet garage' }, // ok
    ],
    expenses: [
      { category: 'parts', daysAgo: 45, amount: 850 },
      { category: 'wash', daysAgo: 12, amount: 80 },
    ],
  },
  {
    owner: 'fleet', plateNumber: '608 MPF', make: 'Honda', model: 'TMX 125 Alpha', year: 2023,
    type: 'motorcycle', fuelType: 'gasoline', status: 'active',
    startingOdometer: 22000, kmPerDay: 70, kmPerLiter: 50, fillEveryDays: 6, pricePerLiter: 63.5,
    services: [
      { name: 'Air filter replacement', daysAgo: 160, cost: 300, shop: 'Fleet garage' }, // ok
      { name: 'Change oil', daysAgo: 150, cost: 450, shop: 'Fleet garage' },
      { name: 'Brake check', daysAgo: 140, cost: 350, shop: 'Fleet garage' }, // due soon: 200 km left
      { name: 'Change oil', daysAgo: 75, cost: 450, shop: 'Fleet garage' }, // overdue: 250 km past
    ],
    expenses: [{ category: 'parts', daysAgo: 30, amount: 650 }],
  },
  {
    owner: 'fleet', plateNumber: '317 RTY', make: 'Suzuki', model: 'Raider R150', year: 2017,
    type: 'motorcycle', fuelType: 'gasoline', status: 'retired',
    startingOdometer: 40000, kmPerDay: 60, kmPerLiter: 40, fillEveryDays: 6, pricePerLiter: 63.5,
    lastActiveDaysAgo: 60, // retired 60 days ago: no logs after that
    services: [
      { name: 'Change oil', daysAgo: 150, cost: 450, shop: 'Fleet garage' },
      { name: 'Brake check', daysAgo: 100, cost: 350, shop: 'Fleet garage' },
    ],
    expenses: [{ category: 'parts', daysAgo: 70, amount: 4800 }],
  },
  {
    owner: 'fleet', plateNumber: 'NFX 3396', make: 'Toyota', model: 'HiAce', year: 2020,
    type: 'van', fuelType: 'diesel', status: 'active',
    startingOdometer: 80000, kmPerDay: 120, kmPerLiter: 10, fillEveryDays: 4, pricePerLiter: 66.5,
    services: [
      { name: 'Brake check', daysAgo: 170, cost: 1200, shop: 'Fleet garage' }, // overdue: far past 10,000 km
      { name: 'Air filter replacement', daysAgo: 120, cost: 1100, shop: 'Fleet garage' }, // ok
      { name: 'Tire rotation', daysAgo: 80, cost: 800, shop: 'Fleet garage' }, // due soon: 400 km left
      { name: 'Change oil', daysAgo: 40, cost: 3200, shop: 'Fleet garage' }, // due soon: 200 km left
    ],
    expenses: [
      { category: 'insurance', daysAgo: 160, amount: 12000 },
      { category: 'toll', daysAgo: 6, amount: 520 },
      { category: 'toll', daysAgo: 2, amount: 310 },
      { category: 'parking', daysAgo: 1, amount: 150 },
    ],
  },
];

function odometerAt(plan, days) {
  return plan.startingOdometer + plan.kmPerDay * (HISTORY_DAYS - days);
}

// Full-tank fill-ups from the start of the history up to the last active day
function buildFuelLogs(vehicleId, plan) {
  const lastDay = plan.lastActiveDaysAgo ?? 0;
  const fuelLog = (days, liters, fullTank) => ({
    vehicle: vehicleId,
    date: daysAgo(days),
    odometer: odometerAt(plan, days),
    liters: roundTo2(liters),
    pricePerLiter: plan.pricePerLiter,
    fullTank,
  });

  const logs = [];
  for (let days = HISTORY_DAYS; days >= lastDay; days -= plan.fillEveryDays) {
    let liters = (plan.kmPerDay * plan.fillEveryDays) / plan.kmPerLiter;
    if (days === plan.flaggedFillDaysAgo) liters *= 1.5;

    // A partial fill between the previous fill-up and this one: its liters belong to this tank
    const partial = plan.partialFillDaysAgo;
    if (partial && days < partial && days + plan.fillEveryDays > partial) {
      logs.push(fuelLog(partial, PARTIAL_FILL_LITERS, false));
      liters -= PARTIAL_FILL_LITERS;
    }
    logs.push(fuelLog(days, liters, true));
  }
  return logs;
}

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
  }
  await connectDB(process.env.MONGO_URI);

  await Promise.all([
    Owner.deleteMany({}),
    Vehicle.deleteMany({}),
    ServiceType.deleteMany({}),
    ServiceLog.deleteMany({}),
    FuelLog.deleteMany({}),
    Expense.deleteMany({}),
  ]);

  const ownerDocs = await Owner.create(owners.map(({ key, ...owner }) => owner));
  const ownerIdByKey = Object.fromEntries(owners.map((owner, i) => [owner.key, ownerDocs[i]._id]));

  const typeDocs = await ServiceType.create(serviceTypes);
  const typeIdByName = Object.fromEntries(typeDocs.map((type) => [type.name, type._id]));

  const fuelLogs = [];
  const serviceLogs = [];
  const expenses = [];

  for (const plan of vehicles) {
    const vehicle = await Vehicle.create({
      owner: ownerIdByKey[plan.owner],
      plateNumber: plan.plateNumber,
      make: plan.make,
      model: plan.model,
      year: plan.year,
      type: plan.type,
      fuelType: plan.fuelType,
      startingOdometer: plan.startingOdometer,
      status: plan.status,
    });

    fuelLogs.push(...buildFuelLogs(vehicle._id, plan));
    for (const service of plan.services) {
      serviceLogs.push({
        vehicle: vehicle._id,
        serviceType: typeIdByName[service.name],
        date: daysAgo(service.daysAgo),
        odometer: odometerAt(plan, service.daysAgo),
        cost: service.cost,
        shop: service.shop,
      });
    }
    for (const expense of plan.expenses) {
      expenses.push({ vehicle: vehicle._id, date: daysAgo(expense.daysAgo), category: expense.category, amount: expense.amount });
    }
  }

  // insertMany runs the schema validators on every record
  await FuelLog.insertMany(fuelLogs);
  await ServiceLog.insertMany(serviceLogs);
  await Expense.insertMany(expenses);

  console.log('Seed complete:');
  console.log(`  owners:        ${ownerDocs.length}`);
  console.log(`  vehicles:      ${vehicles.length}`);
  console.log(`  service types: ${typeDocs.length}`);
  console.log(`  service logs:  ${serviceLogs.length}`);
  console.log(`  fuel logs:     ${fuelLogs.length}`);
  console.log(`  expenses:      ${expenses.length}`);
  if (!plateDigitForMonth(thisMonth) && !plateDigitForMonth(nextMonth)) {
    console.log('  Note: no plate renews this month or next month (only possible in November).');
  }

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});

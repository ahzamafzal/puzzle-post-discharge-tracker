/*
 * Puzzle Post-Discharge Tracker API
 * ---------------------------------
 * This Express.js server defines a REST API for the Puzzle tracker.
 * It is intentionally lightweight and uses in-memory data for demonstration
 * purposes. In a real deployment you would connect it to a Postgres
 * database via Prisma (see ../prisma/schema.prisma) and implement
 * authentication/authorization middleware.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Sample mock data matching the Prisma models
const healthSystems = [
  { id: 'hs1', name: 'Corewell Health East' },
  { id: 'hs2', name: 'OSF HealthCare' },
  { id: 'hs3', name: 'Adventist Health - Maryland' },
];

const snfChains = [
  { id: 'c1', name: 'Prestige' },
  { id: 'c2', name: 'Majestic' },
  { id: 'c3', name: 'Stellar' },
];

const facilities = [
  { id: 'f1', chainId: 'c1', orgId: 'hs1', name: 'Prestige - Danville', address: 'Danville, IL', bedCount: 110 },
  { id: 'f2', chainId: 'c1', orgId: 'hs2', name: 'Prestige - Pontiac', address: 'Pontiac, IL', bedCount: 96 },
  { id: 'f3', chainId: 'c2', orgId: 'hs1', name: 'Majestic - Bloomington', address: 'Bloomington, IL', bedCount: 120 },
  { id: 'f4', chainId: 'c3', orgId: 'hs3', name: 'Stellar - Scioto', address: 'Scioto, OH', bedCount: 88 },
];

// Example patient stub
const patients = Array.from({ length: 10 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Patient ${i + 1}`,
  mrn: `MRN-${1000 + i}`,
  orgId: 'hs1',
  facilityId: facilities[i % facilities.length].id,
  riskScore: Math.floor(Math.random() * 100),
  riskTier: 'Medium',
  atHome: i % 3 === 0,
}));

// Simple helper to filter patients by facility
const filterPatientsByFacility = fid => patients.filter(p => p.facilityId === fid);

// API endpoints

// Health system facilities list
app.get('/organizations/:orgId/facilities', (req, res) => {
  const { orgId } = req.params;
  const orgFacilities = facilities.filter(f => f.orgId === orgId);
  res.json(orgFacilities);
});

// Facility details
app.get('/facilities/:id', (req, res) => {
  const facility = facilities.find(f => f.id === req.params.id);
  if (!facility) return res.status(404).json({ error: 'Facility not found' });
  res.json(facility);
});

// Patients at facility (optionally filter to home program)
app.get('/facilities/:id/patients', (req, res) => {
  const { id } = req.params;
  const { status } = req.query; // in_snf or home
  let result = filterPatientsByFacility(id);
  if (status === 'home') result = result.filter(p => p.atHome);
  if (status === 'in_snf') result = result.filter(p => !p.atHome);
  res.json(result);
});

// All patients (for Puzzle view)
app.get('/patients', (req, res) => {
  res.json(patients);
});

// Single patient detail (expand with vitals, tasks, etc. in real API)
app.get('/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// Start server
app.listen(PORT, () => {
  console.log(`Puzzle API listening on port ${PORT}`);
});


import { DiagnosticTest } from './types';

export const TESTS: DiagnosticTest[] = [
  {
    id: 't1',
    name: 'Complete Blood Count (CBC)',
    category: 'Blood',
    price: 250,
    description: 'Measures different components of your blood.',
    duration: '24 Hours',
    preparation: 'No fasting required'
  },
  {
    id: 't2',
    name: 'Lipid Profile',
    category: 'Blood',
    price: 500,
    description: 'Measures cholesterol levels in the blood.',
    duration: '24 Hours',
    preparation: '10-12 hours fasting mandatory'
  },
  {
    id: 't3',
    name: 'HBA1C (Diabetes Check)',
    category: 'Blood',
    price: 600,
    description: 'Monitors average blood glucose over 3 months.',
    duration: '24 Hours'
  },
  {
    id: 't4',
    name: 'Full Body Checkup (Platinum)',
    category: 'General',
    price: 4999,
    description: 'Comprehensive health screening including 80+ parameters.',
    duration: '48 Hours',
    preparation: 'Fasting required'
  },
  {
    id: 't5',
    name: 'Thyroid Profile (T3, T4, TSH)',
    category: 'Blood',
    price: 750,
    description: 'Evaluates thyroid gland function.',
    duration: '24 Hours'
  },
  {
    id: 't6',
    name: 'ECG (Electrocardiogram)',
    category: 'Cardiac',
    price: 350,
    description: 'Records the electrical activity of your heart.',
    duration: 'Immediate'
  }
];

export const TIME_SLOTS = [
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM'
];

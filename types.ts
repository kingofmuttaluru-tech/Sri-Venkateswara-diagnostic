
export interface DiagnosticTest {
  id: string;
  name: string;
  category: 'Blood' | 'Imaging' | 'Cardiac' | 'General';
  price: number;
  description: string;
  duration: string;
  preparation?: string;
}

export interface Booking {
  id: string;
  testIds: string[];
  patientName: string;
  mobileNumber: string;
  date: string;
  timeSlot: string;
  collectionType: 'Home' | 'Centre';
  address?: string;
  status: 'Booked' | 'Sample Collected' | 'In Lab' | 'Report Ready';
  paymentStatus: 'Pending' | 'Paid';
  totalAmount: number;
}

export interface User {
  mobileNumber: string;
  isLoggedIn: boolean;
}

export interface Feedback {
  rating: number;
  comment: string;
  patientName: string;
}

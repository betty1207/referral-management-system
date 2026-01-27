export type ReferralUrgency = 'low' | 'medium' | 'high';
export type ReferralStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Referral {
  id: string;
  patientName: string;
  patientAge: number;
  diagnosis: string;
  referringHospital: string;
  receivingHospital: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  notes?: string;
  qrCode?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralInput {
  patientName: string;
  patientAge: number;
  diagnosis: string;
  referringHospital: string;
  receivingHospital: string;
  urgency: ReferralUrgency;
  notes?: string;
}

export interface UpdateReferralInput {
  status?: ReferralStatus;
  notes?: string;
  rejectionReason?: string;
}


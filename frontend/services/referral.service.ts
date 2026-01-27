import api from './api';

export interface CreateReferralData {
  patientName: string;
  patientAge: number;
  diagnosis: string;
  referringHospital: string;
  receivingHospital: string;
  urgency: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface Referral {
  id: string;
  patientName: string;
  patientAge: number;
  diagnosis: string;
  referringHospital: string;
  receivingHospital: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const referralService = {
  createReferral: async (data: CreateReferralData): Promise<Referral> => {
    const response = await api.post('/referrals', data);
    return response.data;
  },

  getReferrals: async (): Promise<Referral[]> => {
    const response = await api.get('/referrals');
    return response.data;
  },

  getReferralById: async (id: string): Promise<Referral> => {
    const response = await api.get(`/referrals/${id}`);
    return response.data;
  },

  updateReferral: async (id: string, data: Partial<Referral>): Promise<Referral> => {
    const response = await api.put(`/referrals/${id}`, data);
    return response.data;
  },

  approveReferral: async (id: string): Promise<Referral> => {
    const response = await api.post(`/referrals/${id}/approve`);
    return response.data;
  },

  rejectReferral: async (id: string, reason?: string): Promise<Referral> => {
    const response = await api.post(`/referrals/${id}/reject`, { reason });
    return response.data;
  },

  verifyQRCode: async (qrCode: string): Promise<Referral> => {
    const response = await api.get(`/referrals/verify/${qrCode}`);
    return response.data;
  },
};


import { plansApi as api } from './api';

export interface Plan {
  planId: number;
  name: string;
  description: string;
  productName: string;
  imageUrl: string;
  price: number;
  durationDays: number;
  dailyQuota: number;
  maxPerVisit: number;
  active: boolean;
}

export async function getAllPlans(): Promise<Plan[]> {
  return api.getAllPlans();
}

export async function getPlanById(id: number): Promise<Plan> {
  return api.getPlanById(id);
}

export interface LoyaltyMember {
  id: string;
  email: string;
  user_id: string;
  created_at: string;
}

export interface MemberBalance {
  member_id: string;
  email: string;
  points: number;
}

export interface PointsLedgerEntry {
  id: string;
  member_id: string;
  delta_points: number;
  reason: string;
  meta: any;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  cost_points: number;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  active: boolean;
}

export interface RedeemResponse {
  code: string;
}

export interface ErrorResponse {
  error: string;
}
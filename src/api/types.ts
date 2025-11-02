
export type GenericResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type LoginRequest = { username: string; password: string };
export type LoginResponse = { message: string; details: string };

export type CustomerInfoResponse = {
  customerId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  availableBalance: number;
  roles: string;
};

export type StudentTuition = {
  tuitionId: number;
  studentId: string;
  studentName: string;
  amount: number;
  semester: string;
  academicYear: string;
  isPaid: boolean;
};

export type PaymentInitiateRequest = { tuitionId: number };
export type PaymentConfirmationRequest = { tuitionId: number; otpCode: string };

export type PaymentTransaction = {
  paymentId: number;
  customerId: number;
  tuitionId: number;
  amount: number;
  paymentDate: string; // ISO
};

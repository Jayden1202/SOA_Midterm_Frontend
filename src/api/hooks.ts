
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  LoginRequest, LoginResponse, GenericResponse,
  CustomerInfoResponse, StudentTuition,
  PaymentInitiateRequest, PaymentConfirmationRequest,
  PaymentTransaction
} from "./types";

export const useLogin = () => useMutation<LoginResponse, Error, LoginRequest>({
  mutationFn: (body) => api<LoginResponse>("/auth/login", { method: "POST", body }),
});

export const useLogout = () => useMutation<LoginResponse, Error, void>({
  mutationFn: () => api<LoginResponse>("/auth/logout", { method: "POST" }),
});

export const useMe = () => useQuery({
  queryKey: ["me"],
  queryFn: () => api<GenericResponse<CustomerInfoResponse>>("/customer/info"),
  retry: (count, error: any) => {
    return error?.message?.toLowerCase()?.includes("auth") ? false : count < 1;
  }
});

export const useBalance = () => useQuery({
  queryKey: ["balance"],
  queryFn: () => api<GenericResponse<number>>("/customer/balance"),
  enabled: false
});

export const useTuitionByStudentId = (studentId: string | null) => useQuery({
  queryKey: ["tuition", studentId],
  enabled: !!studentId,
  queryFn: () => api<GenericResponse<StudentTuition[]>>(`/tuition/studentId/${studentId}`),
});

export const usePaymentInitiate = () => useMutation<GenericResponse<string>, Error, PaymentInitiateRequest>({
  mutationFn: (body) => api(`/payment/initiate`, { method: "POST", body }),
});

export const usePaymentResend = () => useMutation<GenericResponse<string>, Error, PaymentInitiateRequest>({
  mutationFn: (body) => api(`/payment/resend`, { method: "POST", body }),
});

export const usePaymentConfirm = () => {
  const qc = useQueryClient();
  return useMutation<GenericResponse<PaymentTransaction>, Error, PaymentConfirmationRequest>({
    mutationFn: (body) => api(`/payment/confirm`, { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance"] });
      qc.invalidateQueries({ queryKey: ["history"] });
    }
  });
};

export const usePaymentHistory = () => useQuery({
  queryKey: ["history"],
  queryFn: () => api<GenericResponse<PaymentTransaction[]>>(`/payment/info`),
  enabled: false
});

export type CalculatorConfig = {
  selected: string[];
  quantities: Record<string, number>;
  discount: number;
};

export type KpStatus = "none" | "draft" | "submitted" | "approved" | "rejected";

export type Client = {
  id: number;
  request_id: string;
  client_name: string;
  client_phone: string;
  client_company: string;
  project_type: string;
  budget: string;
  base_price: number;
  partner_price: number;
  commission: number;
  status: string;
  notes: string;
  description: string | null;
  calculator_config: CalculatorConfig | null;
  kp_status: KpStatus;
  kp_content: string | null;
  kp_admin_feedback: string | null;
  kp_submitted_at: string | null;
  kp_reviewed_at: string | null;
  created_at: string;
};

export type KpMessage = {
  id: number;
  project_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type Partner = {
  partner_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  ref_code: string;
  telegram_id: string | null;
  telegram_username: string | null;
  commission_rate: number;
};

export type DashboardData = {
  partner: Partner;
  clients: Client[];
  stats: {
    totalClients: number;
    activeClients: number;
    totalEarned: number;
  };
};

export const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/10 text-blue-600" },
  discussing: { label: "Обсуждение", color: "bg-yellow-500/10 text-yellow-600" },
  in_progress: { label: "В работе", color: "bg-brand-500/10 text-brand-600" },
  review: { label: "На проверке", color: "bg-purple-500/10 text-purple-600" },
  completed: { label: "Завершён", color: "bg-green-500/10 text-green-600" },
  cancelled: { label: "Отменён", color: "bg-red-500/10 text-red-500" },
};

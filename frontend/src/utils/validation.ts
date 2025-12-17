import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Email không hợp lệ');

// Phone validation (Vietnamese format)
export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

// Register form schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: emailSchema,
  password: passwordSchema,
  dob: z.string().min(1, 'Ngày sinh là bắt buộc'),
  position: z.enum(['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger'], {
    errorMap: () => ({ message: 'Vui lòng chọn vị trí' }),
  }),
  phone: phoneSchema,
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

// Create team schema
export const createTeamSchema = z.object({
  teamName: z.string().min(2, 'Tên đội phải có ít nhất 2 ký tự'),
  monthlyFeeAmount: z.number().min(0, 'Phí tháng phải >= 0'),
});

// Join team schema
export const joinTeamSchema = z.object({
  inviteCode: z.string().length(16, 'Mã mời phải có 16 ký tự'),
});

// Create match schema
export const createMatchSchema = z.object({
  opponentName: z.string().min(2, 'Tên đối thủ phải có ít nhất 2 ký tự'),
  time: z.string().min(1, 'Thời gian trận đấu là bắt buộc'),
  location: z.string().min(2, 'Địa điểm phải có ít nhất 2 ký tự'),
  contactPerson: z.string().optional(),
  votingDeadline: z.string().min(1, 'Deadline bình chọn là bắt buộc'),
});

// Vote schema
export const voteSchema = z.object({
  status: z.enum(['Participate', 'Absent', 'Late'], {
    errorMap: () => ({ message: 'Vui lòng chọn trạng thái' }),
  }),
  guestCount: z.number().min(0, 'Số khách phải >= 0').optional(),
  note: z.string().optional(),
});

// Transaction schema
export const transactionSchema = z.object({
  amount: z.number().min(1, 'Số tiền phải > 0'),
  type: z.enum(['FundCollection', 'Expense', 'GuestPayment', 'MatchExpense', 'MonthlyFee'], {
    errorMap: () => ({ message: 'Vui lòng chọn loại giao dịch' }),
  }),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  file: z.instanceof(File).optional(),
});

// Payment request schema
export const paymentRequestSchema = z.object({
  amount: z.number().min(1, 'Số tiền phải > 0'),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  file: z.instanceof(File, { message: 'Ảnh chứng từ là bắt buộc' }),
});

// File validation helper
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File không hợp lệ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

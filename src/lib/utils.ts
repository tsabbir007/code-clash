import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function handleApiResponse<T = any>(
  response: Response,
  successMessage?: string,
  errorMessage?: string
): Promise<ApiResponse<T>> {
  try {
    const data = await response.json()

    if (response.ok && data.success) {
      // if (successMessage) {
      //   toast.success(successMessage)
      // }
      return { success: true, data: data.data || data }
    } else {
      const errorMsg = errorMessage || data.error || data.message || 'Operation failed'
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  } catch (error) {
    const errorMsg = errorMessage || 'Network error occurred'
    toast.error(errorMsg)
    return { success: false, error: errorMsg }
  }
}

export function showToastForResponse<T = any>(
  response: ApiResponse<T>,
  successMessage?: string,
  errorMessage?: string
): void {
  if (response.success) {
    // if (successMessage) {
    //   toast.success(successMessage)
    // }
  } else {
    const errorMsg = errorMessage || response.error || 'Operation failed'
    toast.error(errorMsg)
  }
}

export function showSuccessToast(message: string): void {
  toast.success(message)
}

export function showErrorToast(message: string): void {
  toast.error(message)
}

export function showInfoToast(message: string): void {
  toast.info(message)
}

export function showWarningToast(message: string): void {
  toast.warning(message)
}

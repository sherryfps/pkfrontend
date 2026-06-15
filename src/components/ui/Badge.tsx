import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva('badge', {
  variants: {
    variant: {
      default: 'badge-neutral',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'badge-info',
      primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
    },
  },
  defaultVariants: { variant: 'default' },
})

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return <span className={`${badgeVariants({ variant })} ${className}`}>{children}</span>
}

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    PAYMENT_PENDING: { label: 'Payment Pending', variant: 'warning' },
    PAYMENT_VERIFIED: { label: 'Payment Verified', variant: 'info' },
    DESIGN_IN_PROGRESS: { label: 'Design In Progress', variant: 'info' },
    DESIGN_APPROVED: { label: 'Design Approved', variant: 'success' },
    PRODUCTION: { label: 'In Production', variant: 'primary' },
    QUALITY_CHECK: { label: 'Quality Check', variant: 'info' },
    DISPATCH_READY: { label: 'Dispatch Ready', variant: 'success' },
    DISPATCHED: { label: 'Dispatched', variant: 'success' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    CANCELLED: { label: 'Cancelled', variant: 'error' },
    REFUNDED: { label: 'Refunded', variant: 'error' },
  }
  const config = map[status] || { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export const PaymentStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    PARTIAL: { label: 'Partial', variant: 'info' },
    ADVANCE_PAID: { label: 'Advance Paid', variant: 'info' },
    FULLY_PAID: { label: 'Fully Paid', variant: 'success' },
    REFUNDED: { label: 'Refunded', variant: 'error' },
  }
  const config = map[status] || { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

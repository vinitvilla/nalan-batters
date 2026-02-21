/**
 * ChargeRow Component
 * Displays a charge line item with optional waived/strikethrough styling
 * Consolidates pricing display logic used in OrderSummary and CartDropdown
 */

interface ChargeRowProps {
  label: string;
  amount: number;
  isWaived?: boolean;
  originalAmount?: number;
  className?: string;
  labelClassName?: string;
  amountClassName?: string;
}

export function ChargeRow({
  label,
  amount,
  isWaived = false,
  originalAmount,
  className = "text-sm text-gray-600",
  labelClassName = "",
  amountClassName = "",
}: ChargeRowProps) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span className={labelClassName}>{label}</span>
      {isWaived && originalAmount !== undefined ? (
        <div className="flex items-center gap-2">
          <span className={`line-through text-red-500 ${amountClassName}`}>
            ${originalAmount.toFixed(2)}
          </span>
          <span className={`text-green-600 font-semibold ${amountClassName}`}>
            $0.00
          </span>
        </div>
      ) : (
        <span className={amountClassName}>${amount.toFixed(2)}</span>
      )}
    </div>
  );
}

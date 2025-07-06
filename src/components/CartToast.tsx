import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function showAddToCartToast({ onViewCart }: { onViewCart: () => void }) {
  toast.success(
    <div className="flex flex-row items-center gap-1">
      <span>Item added to cart!</span>
      <Button
        className="mt-1 w-fit"
        size="sm"
        variant="default"
        onClick={onViewCart}
      >
        View Cart
      </Button>
    </div>,
    {
      duration: 3000,
      position: "bottom-right",
    }
  );
}

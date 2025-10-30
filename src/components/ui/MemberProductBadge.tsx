// import { FaGift } from "react-icons/fa6";
import { FiGift } from "react-icons/fi";

type MemberProductBadgeProps = {
  count: number;
};

const MemberProductBadge = ({ count }: MemberProductBadgeProps) => {
  const containerClassName =
    "relative flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm text-brand";

  return (
    <div className={containerClassName} aria-label={`${count} linked products`}>
      <div className="relative flex items-center">
        <FiGift className="text-lg" aria-hidden="true" />
        <span
          className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full px-[0.35rem] leading-none"
          style={{ backgroundColor: "currentColor" }}
        >
          <span className="text-[0.65rem] text-primary ">{count}</span>
        </span>
      </div>
    </div>
  );
};

export default MemberProductBadge;

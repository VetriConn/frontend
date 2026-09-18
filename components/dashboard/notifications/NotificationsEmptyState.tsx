import { HiOutlineBell } from "react-icons/hi2";
import { PANEL_SURFACE } from "@/components/ui/panelStyles";

export function NotificationsEmptyState() {
  return (
    <div className={PANEL_SURFACE}>
      {/* Empty card header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">No unread notifications</p>
      </div>

      {/* Empty illustration */}
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <HiOutlineBell className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          You&apos;re all caught up
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-[320px] leading-relaxed">
          There are no new notifications at this time. We&apos;ll let you know
          when there&apos;s something important.
        </p>
      </div>
    </div>
  );
}

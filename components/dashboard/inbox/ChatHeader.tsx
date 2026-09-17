import { HiOutlineArrowLeft } from "react-icons/hi2";
import { Avatar } from "@/components/ui/Avatar";

interface ChatHeaderProps {
  name: string;
  subtitle: string;
  avatar?: string | null;
  email?: string;
  phone?: string;
  onBack?: () => void;
}

export function ChatHeader({
  name,
  subtitle,
  avatar,
  email,
  phone,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <Avatar src={avatar} name={name} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
      </div>
      {(email || phone) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          {email && <span>{email}</span>}
          {email && phone && <span>•</span>}
          {phone && <span>{phone}</span>}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { HiOutlineSparkles, HiOutlineArrowLeft } from "react-icons/hi2";

interface AdminPlaceholderProps {
  title: string;
  description: string;
}

const AdminPlaceholder = ({ title, description }: AdminPlaceholderProps) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <HiOutlineSparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          {description}
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default AdminPlaceholder;

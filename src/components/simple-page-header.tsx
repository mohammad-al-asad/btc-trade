"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
export const PageHeader = ({ label }: { label: string }) => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="flex items-center px-4 py-5 border-b border-b-[rgb(39,39,39)] ">
      <button onClick={handleBack} className="cursor-pointer">
        <FaArrowLeft className="text-white w-5 h-5" />
      </button>
      <div className="flex-1 text-center font-medium">
        <h4 className="text-white text-xl ">{label}</h4>
      </div>
    </div>
  );
};

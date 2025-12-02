import React from "react";
import { ScaleLoader } from "react-spinners";
const DataLoading = () => {
  return (
    <div className="flex items-center justify-center">
      <ScaleLoader className="text-main" color="#6cf4ef" />
    </div>
  );
};

export default DataLoading;

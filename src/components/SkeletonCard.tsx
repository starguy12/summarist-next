"use client";

import React from "react";

export default function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-48 animate-pulse">
      <div>
        {/* Top bar (Category tag placeholder) */}
        <div className="h-6 w-24 bg-gray-200 rounded-full mb-4"></div>
        
        {/* Title placeholder */}
        <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-2"></div>
        
        {/* Author placeholder */}
        <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
      </div>
      
      {/* Bottom meta details placeholder */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-10 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}

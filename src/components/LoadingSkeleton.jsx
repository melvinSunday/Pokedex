const LoadingSkeleton = () => (
    <div className="relative bg-gradient-to-br from-gray-700/80 to-gray-800/80 rounded-3xl p-6 shadow-lg animate-pulse h-[400px]">
      {/* Background design */}
      <div className="absolute inset-0 opacity-30">
        {/* ... SVG background code ... */}
      </div>
      <div className="relative w-full h-full">
        <div className="absolute top-4 right-4 z-10">
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
        </div>
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="h-8 bg-gray-300 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
              <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-40 h-40 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  export default LoadingSkeleton;
const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] ${className}`}
    ></div>
  );
};

export default Skeleton;

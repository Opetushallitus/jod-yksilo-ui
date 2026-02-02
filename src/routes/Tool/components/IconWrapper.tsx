export const IconWrapper = ({ color, Icon }: { color: string; Icon: React.ComponentType<{ size: number }> }) => {
  return (
    <div className="rounded-full size-7 text-white flex items-center justify-center" style={{ backgroundColor: color }}>
      <Icon size={18} />
    </div>
  );
};

export const IconWrapper = ({ color, Icon }: { color: string; Icon: React.ComponentType<{ size: number }> }) => {
  return (
    <div className="flex size-7 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
      <Icon size={18} />
    </div>
  );
};

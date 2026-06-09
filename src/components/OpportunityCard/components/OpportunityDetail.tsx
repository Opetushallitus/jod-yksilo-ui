interface OpportunityDetailProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export const OpportunityDetail = ({ title, value, icon }: OpportunityDetailProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 font-arial text-attrib-title">
        <span>{title}</span>
        {icon}
      </div>
      <div className="text-heading-3 text-primary-1-dark">{value}</div>
    </div>
  );
};

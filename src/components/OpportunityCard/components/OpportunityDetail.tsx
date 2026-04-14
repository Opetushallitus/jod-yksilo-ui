interface OpportunityDetailProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export const OpportunityDetail = ({ title, value, icon }: OpportunityDetailProps) => {
  return (
    <div className="flex flex-col">
      <div className="text-attrib-title font-arial flex gap-4 items-center">
        <span>{title}</span>
        {icon}
      </div>
      <div className="text-heading-3 text-secondary-1-dark">{value}</div>
    </div>
  );
};

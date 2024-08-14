type CardType = 'work' | 'education';
interface OpportunityCardProps {
  name: string;
  description: string;
  matchValue: number;
  matchLabel: string;
  type: CardType;
}

const bgForType = (type: CardType) => {
  if (type === 'work') {
    return 'bg-[#AD4298]';
  }
  return 'bg-[#00818A]';
};

const Match = ({ match, label, bg }: { match: number; label: string; bg: string }) => {
  return (
    <div
      className={`${bg} flex flex-row shrink-0 sm:flex-col rounded-[16px] sm:rounded-[40px] sm:min-h-[80px] w-[132px] sm:w-[80px] h-[32px] text-white justify-center text-center items-center`}
    >
      <span className="mr-3 sm:mr-0 font-semibold text-[22px] sm:text-[24px]">{`${match}%`}</span>
      <span className="flex justify-center text-[12px] font-bold">{label}</span>
    </div>
  );
};
export const OpportunityCard = ({ name, description, matchValue, matchLabel, type }: OpportunityCardProps) => {
  return (
    <div className="rounded-[8px] shadow-[0_1px_1px_1px_rgba(0,0,0,0.10)] bg-white pt-5 pr-5 pl-6 pb-7">
      <div className="flex flex-col sm:flex-row sm:gap-5 gap-3">
        <Match match={matchValue} label={matchLabel} bg={bgForType(type)} />
        <div className="flex flex-col">
          <span className="text-heading-3 font-poppins text-black">{name}</span>
          <span className="text-[16px]">{description}</span>
        </div>
      </div>
    </div>
  );
};

interface TitleProps {
  value: string;
}

export const Title = ({ value }: TitleProps) => <title>{value}</title>;

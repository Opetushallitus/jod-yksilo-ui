import React from 'react';
import { HelpingToolLinkItemProps, HelpingToolProfileLinkItemProps } from '.';

interface HelpingToolsContentProps {
  children: (
    | React.ReactElement<HelpingToolProfileLinkItemProps>
    | React.ReactElement<HelpingToolLinkItemProps>
    | React.ReactNode
  )[];
  text: string;
}

export const HelpingToolsContent = ({ children, text }: HelpingToolsContentProps) => {
  return (
    <>
      <p className="text-body-xs sm:text-body-sm mb-5">{text}</p>
      <ul className="flex flex-col gap-5 text-button-md">{children}</ul>
    </>
  );
};

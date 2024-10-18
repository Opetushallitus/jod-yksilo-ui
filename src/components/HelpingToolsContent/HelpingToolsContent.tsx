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
      <span className="text-body-sm sm:text-body-xs">
        <div>{text}</div>
      </span>
      <ul className="flex flex-col gap-4 text-button-md">{children}</ul>
    </>
  );
};

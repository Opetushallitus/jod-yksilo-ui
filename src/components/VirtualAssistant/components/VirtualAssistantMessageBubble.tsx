import { cx } from '@jod/design-system';

export const VirtualAssistantMessageBubble = ({ message, isUser }: { message: string; isUser: boolean }) => {
  return (
    <div className={cx('flex relative', isUser ? 'justify-end' : 'justify-start')}>
      {isUser ? (
        <div
          className="absolute right-0 -bottom-3 w-0 h-0 border-8 border-l-0 border-t-transparent border-b-transparent border-secondary-1-light-3"
          aria-hidden
        />
      ) : (
        <div
          className="absolute left-0 -top-3 w-0 h-0 border-8 border-r-0 border-t-transparent border-b-transparent border-bg-gray"
          aria-hidden
        />
      )}
      <div
        className={cx(
          'max-w-full w-fit sm:max-w-[calc(100%-50px)] text-body-sm-mobile sm:text-body-sm whitespace-pre-wrap wrap-break-word rounded px-5 py-4',
          isUser ? 'bg-secondary-1-light-3' : 'bg-bg-gray',
        )}
      >
        {message}
      </div>
    </div>
  );
};

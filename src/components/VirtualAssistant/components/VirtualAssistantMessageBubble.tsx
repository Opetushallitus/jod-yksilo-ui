import { cx } from '@jod/design-system';

export const VirtualAssistantMessageBubble = ({ message, isUser }: { message: string; isUser: boolean }) => {
  return (
    <div className={cx('relative flex', isUser ? 'justify-end' : 'justify-start')}>
      {isUser ? (
        <div
          className="absolute right-0 -bottom-3 h-0 w-0 border-8 border-l-0 border-secondary-1-light-3 border-t-transparent border-b-transparent"
          aria-hidden
        />
      ) : (
        <div
          className="absolute -top-3 left-0 h-0 w-0 border-8 border-r-0 border-bg-gray border-t-transparent border-b-transparent"
          aria-hidden
        />
      )}
      <div
        className={cx(
          'w-fit max-w-full rounded px-5 py-4 text-body-sm-mobile wrap-break-word whitespace-pre-wrap sm:max-w-[calc(100%-50px)] sm:text-body-sm',
          isUser ? 'bg-secondary-1-light-3' : 'bg-bg-gray',
        )}
      >
        {message}
      </div>
    </div>
  );
};

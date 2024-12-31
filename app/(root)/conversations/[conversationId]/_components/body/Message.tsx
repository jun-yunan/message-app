import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { ContextMenuMessage } from '../context-menu-message';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

type Props = {
  fromCurrentUser: boolean;
  senderImage: string;
  senderName: string;
  lastByUser: boolean;
  content: string[];
  seen?: React.ReactNode;
  createdAt: number;
  type: string;
  fileUrl?: string | null | undefined;
  formatFile?: string | null | undefined;
};

const Message = ({
  content,
  createdAt,
  fromCurrentUser,
  lastByUser,
  senderImage,
  senderName,
  seen,
  type,
  fileUrl,
  formatFile,
}: Props) => {
  const formatTime = (timestamp: number) => {
    return format(timestamp, 'HH:mm');
  };
  return (
    <ContextMenuMessage isFile={!!fileUrl} fromCurrentUser={!!fromCurrentUser}>
      <div
        className={cn('flex items-end', {
          'justify-center': fromCurrentUser,
        })}
      >
        <div
          className={cn('flex flex-col w-full mx-2', {
            'order-1 items-end': fromCurrentUser,
            'order-2 items-start': !fromCurrentUser,
          })}
        >
          <div
            className={cn('px-4 py-2 rounded-lg max-w-[70%]', {
              'bg-primary text-primary-foreground': fromCurrentUser,
              'bg-secondary text-secondary-foreground': !fromCurrentUser,
              'rounded-br-none': !lastByUser && fromCurrentUser,
              'rounded-bl-none': !lastByUser && !fromCurrentUser,
            })}
          >
            {formatFile && fileUrl && (
              <div className="w-full h-full mb-2">
                {formatFile.startsWith('image') && (
                  <Image
                    src={fileUrl}
                    className="object-cover w-full h-full rounded-lg"
                    alt="Image"
                    width={200}
                    height={200}
                  />
                )}
              </div>
            )}
            {type === 'text' ? (
              <p className="text-wrap break-words whitespace-pre-wrap break-all">
                {content}
              </p>
            ) : null}
            <p
              className={cn('text-xs flex w-full my-1', {
                'text-primary-foreground justify-end': fromCurrentUser,
                'text-secondary-foreground justify-start': !fromCurrentUser,
              })}
            >
              {formatTime(createdAt)}
            </p>
          </div>
          {seen}
        </div>

        <Avatar
          className={cn('relative w-8 h-8', {
            'order-2': fromCurrentUser,
            'order-1': !fromCurrentUser,
            invisible: lastByUser,
          })}
        >
          <AvatarImage src={senderImage} />
          <AvatarFallback>{senderName.substring(0, 1)}</AvatarFallback>
        </Avatar>
      </div>
    </ContextMenuMessage>
  );
};

export default Message;

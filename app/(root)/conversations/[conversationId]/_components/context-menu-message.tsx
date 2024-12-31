import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Copy,
  CornerUpLeft,
  Forward,
  ImageDown,
  PencilLine,
  Pin,
  Trash,
} from 'lucide-react';

export function ContextMenuMessage({
  children,
  fromCurrentUser,
  isFile,
}: {
  children: React.ReactNode;
  fromCurrentUser?: boolean;
  isFile?: boolean;
}) {
  if (!fromCurrentUser) {
    return <>{children}</>;
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem className="flex items-center gap-x-2">
          <CornerUpLeft className="w-4 h-4" />
          <p>Reply</p>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-x-2">
          <PencilLine className="w-4 h-4" />
          <p>Edit</p>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-x-2">
          <Pin className="w-4 h-4" />
          <p>Pin</p>
        </ContextMenuItem>
        {isFile && (
          <ContextMenuItem className="flex items-center gap-x-2">
            <ImageDown className="w-4 h-4" />
            <p>Save As...</p>
          </ContextMenuItem>
        )}
        <ContextMenuItem className="flex items-center gap-x-2">
          <Copy className="w-4 h-4" />
          <p>{isFile ? 'Copy Image' : 'Copy Text'}</p>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-x-2">
          <Forward className="w-4 h-4" />
          <p>Forward</p>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-x-2">
          <Trash className="w-4 h-4" />
          <p>Delete</p>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

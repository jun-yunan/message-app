/* eslint-disable @next/next/no-img-element */
'use client';

import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { api } from '@/convex/_generated/api';
import { useConversation } from '@/hooks/useConversation';
import { useMutationState } from '@/hooks/useMutationState';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConvexError } from 'convex/values';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import TextareaAutoSize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import {
  FilePlus,
  Link,
  Loader2,
  Paperclip,
  SendHorizonal,
  Smile,
  X,
} from 'lucide-react';
import { EmojiPopover } from './emoji-popover';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGenerateUpload } from '@/features/upload/api/use-generate-upload';
// import { generateUploadUrl } from '@/convex/message';

type Props = {};

const chatMessageSchema = z.object({
  content: z.string().min(1, {
    message: 'This field cannot be empty',
  }),
});

const ChatInput = (props: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>();

  const buttonSubmitRef = useRef<HTMLButtonElement | null>(null);

  const [isPending, setIsPending] = useState(false);

  const [open, onOpen] = useState(false);

  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const { conversationId } = useConversation();

  const { mutate: createMessage, pending } = useMutationState(
    api.message.create,
  );

  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: '',
    },
  });

  const { mutate: generateUploadUrl } = useGenerateUpload();

  const handleSubmit = async (values: z.infer<typeof chatMessageSchema>) => {
    if (file) {
      setIsPending(true);
      const postUrl = await generateUploadUrl({}, { throwError: true });

      if (!postUrl) {
        throw new Error('Url not found');
      }

      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error('Error uploading file');
      }

      const { storageId } = await result.json();

      createMessage({
        conversationId,
        type: 'text',
        content: [values.content],
        storageId,
        formatFile: file.type || undefined,
      })
        .then(() => {
          form.reset();
          onOpen(false);
        })
        .catch((error) => {
          toast.error(
            error instanceof ConvexError ? error.data : 'An error occurred',
          );
        })
        .finally(() => setIsPending(false));
    } else {
      createMessage({
        conversationId,
        type: 'text',
        content: [values.content],
      })
        .then(() => {
          form.reset();
          onOpen(false);
          setIsPending(false);
        })
        .catch((error) => {
          toast.error(
            error instanceof ConvexError ? error.data : 'An error occurred',
          );
        })
        .finally(() => setIsPending(false));
    }
  };

  const handleInputChange = (event: any) => {
    const { value, selectionStart } = event.target;

    if (selectionStart !== null) {
      form.setValue('content', value);
    }
  };

  const onEmojiSelect = (emoji: { native: string }) => {
    form.setValue('content', form.getValues('content') + emoji.native);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setFile(null);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    }
  }, [form, open]);

  return (
    <Card className="w-full p-2 rounded-lg relative">
      <div className="relative flex gap-2 items-end w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-2 items-center w-full justify-between"
          >
            <Dialog open={open} onOpenChange={onOpen}>
              <DialogTrigger>
                <Button size="icon" type="button">
                  <Paperclip />
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[550px] w-full flex flex-col items-start overflow-hidden">
                <DialogHeader>Send a image</DialogHeader>
                <DialogDescription>
                  You can send a image to your friends
                </DialogDescription>
                <Card className="relative w-full h-full flex flex-col items-center justify-center">
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {file ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        width={500}
                        height={500}
                        src={URL.createObjectURL(file)}
                        className="absolute object-cover rounded-lg w-full h-full"
                        alt="Image"
                      />
                      <Button
                        size="icon"
                        type="button"
                        className="absolute -top-3 -right-3"
                        onClick={() => {
                          setFile(null);
                          if (inputFileRef.current) {
                            inputFileRef.current.value = '';
                          }
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (inputFileRef.current) {
                          inputFileRef.current.click();
                        }
                      }}
                    >
                      <FilePlus /> Choose a file
                    </Button>
                  )}
                </Card>
                <div className="w-full flex border-2 p-1 rounded-lg items-center">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => {
                      return (
                        <FormItem className="w-full flex items-center justify-center">
                          <FormControl>
                            <TextareaAutoSize
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  await form.handleSubmit(handleSubmit)();
                                }
                              }}
                              rows={1}
                              maxRows={3}
                              {...field}
                              onChange={handleInputChange}
                              onClick={handleInputChange}
                              placeholder="Type a message..."
                              className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <EmojiPopover onEmojiSelect={onEmojiSelect}>
                    <Button size="icon" type="button" variant="outline">
                      <Smile />
                    </Button>
                  </EmojiPopover>
                </div>
                <DialogFooter className="self-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isPending}
                    type="submit"
                    onClick={() => buttonSubmitRef.current?.click()}
                  >
                    {isPending ? <Loader2 className="animate-spin" /> : 'Send'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => {
                return (
                  <FormItem className="h-full w-full">
                    <FormControl>
                      <TextareaAutoSize
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            await form.handleSubmit(handleSubmit)();
                          }
                        }}
                        rows={1}
                        maxRows={3}
                        {...field}
                        onChange={handleInputChange}
                        onClick={handleInputChange}
                        placeholder="Type a message..."
                        className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <EmojiPopover onEmojiSelect={onEmojiSelect}>
              <Button size="icon" type="button">
                <Smile />
              </Button>
            </EmojiPopover>
            <Button
              ref={buttonSubmitRef}
              disabled={pending}
              size="icon"
              type="submit"
            >
              <SendHorizonal />
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default ChatInput;

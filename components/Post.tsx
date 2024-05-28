"use client";
import { IPostDocument } from "@/mongodb/models/post";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import TimeAgo from "react-timeago";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import deletePostAction from "@/actions/deletePostAction";
import Image from "next/image";
import PostOptions from "./PostOptions";
import { toast } from "sonner";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();
  const isAuthor = user?.id === post.user.userId;

  return (
    <div className="bg-white p-4 rounded-md shadow-md border">
      <div className="flex p-4 space-x-2">
        <div>
          <Avatar>
            <AvatarImage src={post.user.userImage} />
            <AvatarFallback>
              {post.user.firstName?.charAt(0)}
              {post.user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-between flex-1">
          <div>
            <div className="font-semibold">
              {post.user.firstName} {post.user.lastName}
              {""}
              {isAuthor && (
                <Badge className="ml-2" variant="secondary">
                  Author
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">
              @{post.user.firstName}
              {post.user.lastName}-{post.user.userId.toString().slice(-4)}
            </p>
            <p className="text-xs text-gray-400">
              <TimeAgo date={new Date(post.createdAt)} />
            </p>
          </div>
          {isAuthor && (
            <Button
              variant="outline"
              onClick={() => {
                const promise = deletePostAction(post._id as string);

                //Toast
                toast.promise(promise, {
                  loading: "Deleting post...",
                  success: "Post deleted!",
                  error: "Error deleting post",
                });
              }}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>
      <div>
        <p className="px-4 pb-2 mt-2">{post.text}</p>

        {/* If image uploaded put it here ... */}

        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Post Image"
            width={500}
            height={500}
            className="w-full mx-auto"
          />
        )}
      </div>
      {/* PostOptions */}
      <PostOptions postId={post._id as string} post={post} />
    </div>
  );
}

export default Post;

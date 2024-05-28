"use client";

import { IPostDocument } from "@/mongodb/models/post";
import { SignedIn, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LikePostRequestBody } from "@/app/api/posts/[post_id]/like/route";
import { UnLikePostRequestBody } from "@/app/api/posts/[post_id]/unlike/route";
import CommentFeed from "./CommentFeed";
import CommentForm from "./CommentForm";
import { toast } from "sonner";

function PostOptions({
  postId,
  post,
}: {
  postId: string;
  post: IPostDocument;
}) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  useEffect(() => {
    if (user?.id && post.likes?.includes(user.id)) {
      setLiked(true);
    }
  }, [post, user]);

  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const originalLiked = liked;
    const originalLikes = likes;

    const newLikes = liked
      ? likes?.filter((like) => like !== user.id)
      : [...(likes ?? []), user.id]; // If user has liked the post, unlike it, otherwise like it

    const body: LikePostRequestBody | UnLikePostRequestBody = {
      userId: user.id,
    };

    setLiked(!liked);
    setLikes(newLikes);

    const response = await fetch(
      `/api/posts/${post._id}/${liked ? "unlike" : "like"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body }),
      }
    );

    if (!response.ok) {
      setLiked(originalLiked);
      throw new Error("An error occurred while liking the post");
    }

    const fetchLikesResponse = await fetch(`/api/posts/${post._id}/like`);

    if (!fetchLikesResponse.ok) {
      setLikes(originalLikes);
      throw new Error("An error occurred while fetching likes");
    }

    const newLikedData = await fetchLikesResponse.json();

    setLikes(newLikedData);
  };
  return (
    <div>
      <div className="flex justify-between p-4">
        <div>
          {likes && likes.length > 0 && (
            <p className="text-xs text-gray-500 cursor-pointer hover:underline">
              {likes.length} likes
            </p>
          )}
        </div>
        <div>
          {post?.comments && post.comments.length > 0 && (
            <p
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="text-xs text-gray-500 cursor-pointer hover:underline"
            >
              {post.comments.length} comments
            </p>
          )}
        </div>
      </div>
      <div className="flex p-2 justify-between px-2 border-t">
        <Button variant="ghost" className="postButton">
          <ThumbsUpIcon
            onClick={() => {
              const promise = likeOrUnlikePost();

              toast.promise(promise, {
                loading: liked ? "Unliking post..." : "Liking post...",
                success: liked ? "Post unliked!" : "Post liked!",
                error: liked ? "Failed to unlike post" : "Failed liking post",
              });
            }}
            //  If user has liked the post, show filled thumbs up icon
            className={cn("mr-1", liked && "text-[#4881c2] fill-[#4881c2]")}
          />
          Like
        </Button>

        <Button
          variant="ghost"
          className="postButton"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
        >
          <MessageCircle
            className={cn(
              "mr-1",
              isCommentsOpen && "text-gray-600 fill-gray-600"
            )}
          />
          Comment
        </Button>
        <Button variant="ghost" className="postButton">
          <Repeat2 className="mr-1" />
          Repost
        </Button>
        <Button variant="ghost" className="postButton">
          <Send className="mr-1" />
          Send
        </Button>
      </div>
      {isCommentsOpen && (
        <div className="p-4">
          <SignedIn>
            <CommentForm postId={postId} />
            <CommentFeed post={post} />
          </SignedIn>
        </div>
      )}
    </div>
  );
}

export default PostOptions;

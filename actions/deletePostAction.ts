"use server";

import { Post } from "@/mongodb/models/post";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export default async function deletePostAction(postId: string) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("You must be logged in to delete a post");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.user.userId !== user.id) {
    throw new Error("You can only delete your own posts");
  }

  try {
    await post.removePost();
    revalidatePath("/");
  } catch (error) {
    throw new Error("An error occurred while deleting the post");
  }
}

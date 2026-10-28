import type { Request, Response } from "express";
import * as postService from "../services/post.service.js";
import type {
  CreatePostInput,
  UpdatePostInput,
} from "../schemas/post.schema.js";

// The post controller handles HTTP only.
// Each function is named handle... because it handles one HTTP request.
// That keeps it distinct from the service function it calls (postService.createPost).
// Every function has three parts:
//   1. read what it needs from the request
//   2. hand the work to the post service
//   3. send the success response
// It never talks to the database, and it has no try/catch:
// if the service throws, Express sends the error to errorHandler.

const handleCreatePost = async (req: Request, res: Response) => {
  // 1. Read. The validate middleware already checked this body against createPostSchema.
  const input: CreatePostInput = req.body;

  // 2. Delegate.
  const post = await postService.createPost(input);

  // 3. Respond.
  res.status(201).json({
    message: "Post created successfully",
    post: post,
  });
};

const handleListPosts = async (req: Request, res: Response) => {
  // 1. Read. Nothing to read for a list.

  // 2. Delegate.
  const posts = await postService.listPosts();

  // 3. Respond.
  res.status(200).json(posts);
};

// The shape of the URL parameters for routes like /update/:id and /delete/:id.
// Passing it to Request<...> tells TypeScript that req.params.id is a single string.
type PostIdParams = {
  id: string;
};

const handleGetPost = async (req: Request<PostIdParams>, res: Response) => {
  // 1. Read.
  const id = req.params.id;

  // 2. Delegate. The service throws a 404 if the post does not exist.
  const post = await postService.getPost(id);

  // 3. Respond.
  res.status(200).json(post);
};

const handleUpdatePost = async (req: Request<PostIdParams>, res: Response) => {
  // 1. Read. The validate middleware already checked this body against updatePostSchema.
  const id = req.params.id;
  const input: UpdatePostInput = req.body;

  // 2. Delegate. The service throws a 400 or 404 if a rule fails.
  const post = await postService.updatePost(id, input);

  // 3. Respond.
  res.status(200).json({
    message: "Post updated",
    post: post,
  });
};

const handleDeletePost = async (req: Request<PostIdParams>, res: Response) => {
  // 1. Read.
  const id = req.params.id;

  // 2. Delegate. The service throws a 404 if the post does not exist.
  await postService.deletePost(id);

  // 3. Respond. 204 means "it worked, and there is nothing to send back".
  // A 204 response has no body, so we use .send() with nothing instead of .json().
  res.status(204).send();
};

export {
  handleCreatePost,
  handleListPosts,
  handleGetPost,
  handleUpdatePost,
  handleDeletePost,
};

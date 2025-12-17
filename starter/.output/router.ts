import { fromHono } from 'chanfana';
import { Hono } from 'hono';
import { CreateUser } from './endpoints/-create-user';
import { ListUsers } from './endpoints/-list-users';
import { GetUser } from './endpoints/-get-user';
import { UpdateUser } from './endpoints/-update-user';
import { DeleteUser } from './endpoints/-delete-user';
import { CreatePost } from './endpoints/-create-post';
import { ListPosts } from './endpoints/-list-posts';
import { GetPost } from './endpoints/-get-post';
import { UpdatePost } from './endpoints/-update-post';
import { DeletePost } from './endpoints/-delete-post';
import { CreateComment } from './endpoints/-create-comment';
import { ListComments } from './endpoints/-list-comments';
import { GetComment } from './endpoints/-get-comment';
import { UpdateComment } from './endpoints/-update-comment';
import { DeleteComment } from './endpoints/-delete-comment';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post('/users', CreateUser);
    openapi.get('/users', ListUsers);
    openapi.get('/users/:id', GetUser);
    openapi.put('/users/:id', UpdateUser);
    openapi.delete('/users/:id', DeleteUser);
    openapi.post('/posts', CreatePost);
    openapi.get('/posts', ListPosts);
    openapi.get('/posts/:id', GetPost);
    openapi.put('/posts/:id', UpdatePost);
    openapi.delete('/posts/:id', DeletePost);
    openapi.post('/comments', CreateComment);
    openapi.get('/comments', ListComments);
    openapi.get('/comments/:id', GetComment);
    openapi.put('/comments/:id', UpdateComment);
    openapi.delete('/comments/:id', DeleteComment);

// Export the Hono app
export default app;
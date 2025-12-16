import { fromHono } from 'chanfana';
import { Hono } from 'hono';
import { CreateAuthors } from './endpoints/-create-authors';
import { ListAuthorss } from './endpoints/-list-authorss';
import { GetAuthors } from './endpoints/-get-authors';
import { UpdateAuthors } from './endpoints/-update-authors';
import { DeleteAuthors } from './endpoints/-delete-authors';
import { CreatePosts } from './endpoints/-create-posts';
import { ListPostss } from './endpoints/-list-postss';
import { GetPosts } from './endpoints/-get-posts';
import { UpdatePosts } from './endpoints/-update-posts';
import { DeletePosts } from './endpoints/-delete-posts';
import { CreateComments } from './endpoints/-create-comments';
import { ListCommentss } from './endpoints/-list-commentss';
import { GetComments } from './endpoints/-get-comments';
import { UpdateComments } from './endpoints/-update-comments';
import { DeleteComments } from './endpoints/-delete-comments';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post('/authorss', CreateAuthors);
    openapi.get('/authorss', ListAuthorss);
    openapi.get('/authorss/:id', GetAuthors);
    openapi.put('/authorss/:id', UpdateAuthors);
    openapi.delete('/authorss/:id', DeleteAuthors);
    openapi.post('/postss', CreatePosts);
    openapi.get('/postss', ListPostss);
    openapi.get('/postss/:id', GetPosts);
    openapi.put('/postss/:id', UpdatePosts);
    openapi.delete('/postss/:id', DeletePosts);
    openapi.post('/commentss', CreateComments);
    openapi.get('/commentss', ListCommentss);
    openapi.get('/commentss/:id', GetComments);
    openapi.put('/commentss/:id', UpdateComments);
    openapi.delete('/commentss/:id', DeleteComments);

// Export the Hono app
export default app;
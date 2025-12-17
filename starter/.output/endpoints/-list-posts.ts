import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostSchema } from '../schemas/post.js';
import { PostQuerySchema } from '../schemas/post.js';

export class ListPosts extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: PostSchema, 
      primaryKeys: ['id'], 
      tableName: 'posts' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = ['published', 'status'];
  searchFields = ['title'];
  orderByFields = ['publishedAt'];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = PostQuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}
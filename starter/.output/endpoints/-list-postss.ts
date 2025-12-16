import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostsSchema } from '../schemas/posts.js';
import { PostsQuerySchema } from '../schemas/posts.js';

export class ListPostss extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: PostsSchema, 
      primaryKeys: ['id'], 
      tableName: 'postss' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = ['published'];
  searchFields = ['title'];
  orderByFields = ['publishedAt'];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = PostsQuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}
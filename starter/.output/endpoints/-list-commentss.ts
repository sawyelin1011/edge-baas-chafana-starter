import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentsSchema } from '../schemas/comments.js';
import { CommentsQuerySchema } from '../schemas/comments.js';

export class ListCommentss extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: CommentsSchema, 
      primaryKeys: ['id'], 
      tableName: 'commentss' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = ['approved'];
  searchFields = [];
  orderByFields = [];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = CommentsQuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}
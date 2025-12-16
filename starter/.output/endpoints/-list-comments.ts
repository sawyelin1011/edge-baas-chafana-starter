import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentSchema } from '../schemas/comment.js';
import { CommentQuerySchema } from '../schemas/comment.js';

export class ListComments extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: CommentSchema, 
      primaryKeys: ['id'], 
      tableName: 'comments' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = ['approved'];
  searchFields = [];
  orderByFields = [];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = CommentQuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}
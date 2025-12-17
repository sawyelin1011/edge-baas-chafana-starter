import { D1DeleteEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentSchema } from '../schemas/comment.js';

export class DeleteComment extends D1DeleteEndpoint {
  _meta = { 
    model: { 
      schema: CommentSchema, 
      primaryKeys: ['id'], 
      tableName: 'comments' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}
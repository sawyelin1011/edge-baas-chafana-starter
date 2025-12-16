import { D1ReadEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentSchema } from '../schemas/comment.js';

export class GetComment extends D1ReadEndpoint {
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
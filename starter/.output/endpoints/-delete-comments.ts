import { D1DeleteEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentsSchema } from '../schemas/comments.js';

export class DeleteComments extends D1DeleteEndpoint {
  _meta = { 
    model: { 
      schema: CommentsSchema, 
      primaryKeys: ['id'], 
      tableName: 'commentss' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}
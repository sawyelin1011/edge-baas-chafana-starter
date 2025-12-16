import { D1ReadEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentsSchema } from '../schemas/comments.js';

export class GetComments extends D1ReadEndpoint {
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
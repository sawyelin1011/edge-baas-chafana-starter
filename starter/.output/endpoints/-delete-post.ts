import { D1DeleteEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostSchema } from '../schemas/post.js';

export class DeletePost extends D1DeleteEndpoint {
  _meta = { 
    model: { 
      schema: PostSchema, 
      primaryKeys: ['id'], 
      tableName: 'posts' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}
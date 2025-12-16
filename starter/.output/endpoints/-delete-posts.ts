import { D1DeleteEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostsSchema } from '../schemas/posts.js';

export class DeletePosts extends D1DeleteEndpoint {
  _meta = { 
    model: { 
      schema: PostsSchema, 
      primaryKeys: ['id'], 
      tableName: 'postss' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}
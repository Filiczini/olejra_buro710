import 'dotenv/config';
import { db, pool } from './db';
import { posts, blocks } from './db/schema';

async function clearPosts() {
  console.log('Clearing all posts from database...');
  console.log('');

  try {
    const allPosts = await db.select({ id: posts.id }).from(posts);
    const count = allPosts.length;
    console.log(`Found ${count} posts to delete`);

    if (count === 0) {
      console.log('No posts to delete.');
      await pool.end();
      process.exit(0);
    }

    await db.delete(blocks);
    console.log('Deleted all blocks');

    await db.delete(posts);
    console.log(`Successfully deleted ${count} posts`);
    console.log('');
    console.log('Database cleared successfully!');

    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('Error clearing posts:');
    console.error(`  Message: ${error?.message}`);
    await pool.end();
    process.exit(1);
  }
}

clearPosts();

import { supabase } from './config/supabase';

async function clearPosts() {
  console.log('Clearing all posts from database...');
  console.log('');

  try {
    const { data: posts, error: countError } = await supabase
      .from('posts')
      .select('id');

    if (countError) {
      throw countError;
    }

    const count = posts?.length || 0;
    console.log(`Found ${count} posts to delete`);

    if (count === 0) {
      console.log('No posts to delete.');
      process.exit(0);
    }

    const { error: blocksError } = await supabase
      .from('blocks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (blocksError) {
      console.error('Error deleting blocks:', blocksError);
    } else {
      console.log('Deleted all blocks');
    }

    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (postsError) {
      throw postsError;
    }

    console.log(`Successfully deleted ${count} posts`);
    console.log('');
    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Error clearing posts:');
    console.error(`  Code: ${error?.code}`);
    console.error(`  Message: ${error?.message}`);
    process.exit(1);
  }
}

clearPosts();

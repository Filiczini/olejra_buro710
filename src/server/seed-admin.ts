import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

const seedAdmin = async () => {
  console.log('Seeding admin user...');
  console.log(`Email: ${ADMIN_EMAIL}`);

  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingUser) {
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('email', ADMIN_EMAIL);

      if (error) throw error;
      console.log('Admin user password updated successfully');
    } else {
      const { error } = await supabase.from('users').insert({
        email: ADMIN_EMAIL,
        password_hash: passwordHash,
        role: 'admin',
      });

      if (error) throw error;
      console.log('Admin user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

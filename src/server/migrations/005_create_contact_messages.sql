-- Create contact_messages table for storing form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  telegram_sent BOOLEAN DEFAULT FALSE,
  telegram_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

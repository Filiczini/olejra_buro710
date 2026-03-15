-- RPC function to get distinct user emails from activity_logs
-- This avoids fetching the entire table and deduplicating in JS
CREATE OR REPLACE FUNCTION get_unique_user_emails()
RETURNS TABLE(user_email text) AS $$
  SELECT DISTINCT user_email
  FROM activity_logs
  ORDER BY user_email ASC;
$$ LANGUAGE sql STABLE;

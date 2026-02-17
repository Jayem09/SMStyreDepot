-- Push Notifications Database Schema
-- This table stores FCM tokens for push notification subscriptions

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_token ON push_subscriptions(fcm_token);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN push_subscriptions.user_id IS 'Reference to the user who subscribed';
COMMENT ON COLUMN push_subscriptions.fcm_token IS 'Firebase Cloud Messaging token (unique per device)';
COMMENT ON COLUMN push_subscriptions.device_info IS 'JSON object containing browser/device information';

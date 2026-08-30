-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- admin, manager, user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  job_title VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  notes TEXT,
  source VARCHAR(100), -- web, email, phone, referral, etc
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deals/Opportunities table (försäljningsmöjligheter)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'SEK',
  stage VARCHAR(50) DEFAULT 'lead', -- lead, negotiation, proposal, won, lost
  probability DECIMAL(5, 2) DEFAULT 50,
  expected_close_date DATE,
  closed_date DATE,
  closed_reason VARCHAR(100), -- won, lost, stalled, etc
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- call, email, meeting, task, note
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deal stages configuration
CREATE TABLE deal_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL,
  color VARCHAR(7), -- Hex color
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities/Tasks assignments
CREATE TABLE activity_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales pipeline view (for analytics)
CREATE VIEW sales_pipeline AS
SELECT
  d.stage,
  COUNT(*) as deal_count,
  SUM(d.amount) as total_amount,
  AVG(d.amount) as avg_amount,
  AVG(d.probability) as avg_probability
FROM deals d
WHERE d.closed_date IS NULL
GROUP BY d.stage;

-- Create indexes for better performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_due_date ON activities(due_date);

-- Insert default deal stages
INSERT INTO deal_stages (user_id, name, order_index, color) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Lead', 0, '#E0E7FF'),
  ('00000000-0000-0000-0000-000000000000', 'Negotiation', 1, '#BFDBFE'),
  ('00000000-0000-0000-0000-000000000000', 'Proposal', 2, '#86EFAC'),
  ('00000000-0000-0000-0000-000000000000', 'Won', 3, '#4ADE80'),
  ('00000000-0000-0000-0000-000000000000', 'Lost', 4, '#F87171');

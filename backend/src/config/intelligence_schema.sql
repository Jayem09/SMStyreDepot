-- Business Intelligence Tables

-- Customer Segments (RFM Analysis)
CREATE TABLE IF NOT EXISTS customer_segments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    segment VARCHAR(50) NOT NULL, -- 'champions', 'loyal', 'potential', 'at_risk', 'lost'
    recency_score INTEGER CHECK (recency_score BETWEEN 1 AND 5),
    frequency_score INTEGER CHECK (frequency_score BETWEEN 1 AND 5),
    monetary_score INTEGER CHECK (monetary_score BETWEEN 1 AND 5),
    last_purchase_date TIMESTAMP,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    churn_risk_score DECIMAL(3,2) CHECK (churn_risk_score BETWEEN 0 AND 1),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Sales Forecasts
CREATE TABLE IF NOT EXISTS sales_forecasts (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    metric VARCHAR(50) NOT NULL, -- 'revenue', 'orders', 'units'
    predicted_value DECIMAL(10,2) NOT NULL,
    confidence_lower DECIMAL(10,2),
    confidence_upper DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(forecast_date, metric)
);

-- Inventory Recommendations
CREATE TABLE IF NOT EXISTS inventory_recommendations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    recommended_stock INTEGER,
    reorder_point INTEGER,
    safety_stock INTEGER,
    avg_daily_sales DECIMAL(10,2),
    lead_time_days INTEGER DEFAULT 7,
    action VARCHAR(50), -- 'optimal', 'reorder_soon', 'urgent_reorder', 'overstocked'
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_segments_user ON customer_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment ON customer_segments(segment);
CREATE INDEX IF NOT EXISTS idx_customer_segments_churn ON customer_segments(churn_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_sales_forecasts_date ON sales_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_inventory_recs_action ON inventory_recommendations(action);

-- Función para obtener ventas por período
CREATE OR REPLACE FUNCTION get_sales_by_period(
    p_period TEXT DEFAULT 'month',
    p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE
)
RETURNS TABLE (
    period_label TEXT,
    total_sales NUMERIC,
    order_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_period = 'week' THEN
        RETURN QUERY
        SELECT
            TO_CHAR(DATE_TRUNC('day', created_at), 'DD Mon') as period_label,
            COALESCE(SUM(total), 0) as total_sales,
            COUNT(*) as order_count
        FROM orders
        WHERE created_at >= p_start_date
        AND status NOT IN ('cancelled', 'failed')
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY DATE_TRUNC('day', created_at);
    ELSIF p_period = 'month' THEN
        RETURN QUERY
        SELECT
            TO_CHAR(DATE_TRUNC('week', created_at), 'DD Mon') as period_label,
            COALESCE(SUM(total), 0) as total_sales,
            COUNT(*) as order_count
        FROM orders
        WHERE created_at >= p_start_date
        AND status NOT IN ('cancelled', 'failed')
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY DATE_TRUNC('week', created_at);
    ELSE
        RETURN QUERY
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as period_label,
            COALESCE(SUM(total), 0) as total_sales,
            COUNT(*) as order_count
        FROM orders
        WHERE created_at >= p_start_date
        AND status NOT IN ('cancelled', 'failed')
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at);
    END IF;
END;
$$;

-- Función para productos más vendidos
CREATE OR REPLACE FUNCTION get_top_selling_products(p_limit INT DEFAULT 5)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_image TEXT,
    total_sold BIGINT,
    total_revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name::TEXT as product_name,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image,
        COALESCE(SUM(oi.quantity), 0)::BIGINT as total_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'failed')
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT p_limit;
END;
$$;

-- Función para ventas por categoría
CREATE OR REPLACE FUNCTION get_sales_by_category()
RETURNS TABLE (
    category_name TEXT,
    total_sales NUMERIC,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_all NUMERIC;
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO total_all
    FROM orders
    WHERE status NOT IN ('cancelled', 'failed');

    RETURN QUERY
    SELECT
        COALESCE(c.name, 'Sin categoría')::TEXT as category_name,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales,
        CASE WHEN total_all > 0
            THEN ROUND((COALESCE(SUM(oi.quantity * oi.unit_price), 0) / total_all * 100)::NUMERIC, 1)
            ELSE 0
        END as percentage
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'failed')
    GROUP BY c.name
    ORDER BY total_sales DESC
    LIMIT 6;
END;
$$;

-- Función para métricas de conversión
CREATE OR REPLACE FUNCTION get_conversion_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', (SELECT COUNT(*) FROM orders WHERE status NOT IN ('cancelled', 'failed')),
        'total_revenue', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status NOT IN ('cancelled', 'failed')),
        'average_order_value', (SELECT COALESCE(AVG(total), 0) FROM orders WHERE status NOT IN ('cancelled', 'failed')),
        'orders_today', (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status NOT IN ('cancelled', 'failed')),
        'revenue_today', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status NOT IN ('cancelled', 'failed')),
        'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
        'processing_orders', (SELECT COUNT(*) FROM orders WHERE status = 'processing')
    ) INTO result;
    RETURN result;
END;
$$;

-- Función para actividad reciente
CREATE OR REPLACE FUNCTION get_recent_activity(p_limit INT DEFAULT 10)
RETURNS TABLE (
    activity_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    (
        SELECT
            'order'::TEXT as activity_type,
            ('Nueva orden #' || o.order_number)::TEXT as description,
            o.created_at,
            jsonb_build_object('total', o.total, 'status', o.status) as metadata
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT p_limit
    )
    UNION ALL
    (
        SELECT
            'review'::TEXT as activity_type,
            ('Nueva reseña de ' || COALESCE(
                (SELECT name FROM products WHERE id = r.product_id),
                'producto'
            ))::TEXT as description,
            r.created_at,
            jsonb_build_object('rating', r.rating) as metadata
        FROM reviews r
        ORDER BY r.created_at DESC
        LIMIT p_limit
    )
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;
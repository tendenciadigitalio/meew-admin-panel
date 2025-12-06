-- Tabla para guías de tallas
CREATE TABLE IF NOT EXISTS size_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    sizes JSONB NOT NULL DEFAULT '[]',
    measurements JSONB NOT NULL DEFAULT '{}',
    unit TEXT DEFAULT 'cm',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_size_guides_category ON size_guides(category_id);
CREATE INDEX IF NOT EXISTS idx_size_guides_active ON size_guides(is_active);

-- RLS
ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can read size guides" ON size_guides
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage size guides" ON size_guides
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_size_guides_updated_at
BEFORE UPDATE ON size_guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Datos de ejemplo
INSERT INTO size_guides (name, description, sizes, measurements, unit) VALUES
(
    'Guía de Tallas Mujer - Ropa Superior',
    'Medidas para blusas, camisetas y tops de mujer',
    '["XS", "S", "M", "L", "XL"]',
    '{
        "Pecho (cm)": {"XS": "82-86", "S": "86-90", "M": "90-94", "L": "94-98", "XL": "98-102"},
        "Cintura (cm)": {"XS": "62-66", "S": "66-70", "M": "70-74", "L": "74-78", "XL": "78-82"},
        "Largo (cm)": {"XS": "58", "S": "60", "M": "62", "L": "64", "XL": "66"}
    }',
    'cm'
),
(
    'Guía de Tallas Mujer - Pantalones',
    'Medidas para jeans y pantalones de mujer',
    '["24", "26", "28", "30", "32", "34"]',
    '{
        "Cintura (cm)": {"24": "61", "26": "66", "28": "71", "30": "76", "32": "81", "34": "86"},
        "Cadera (cm)": {"24": "86", "26": "91", "28": "96", "30": "101", "32": "106", "34": "111"},
        "Largo (cm)": {"24": "76", "26": "76", "28": "76", "30": "76", "32": "76", "34": "76"}
    }',
    'cm'
),
(
    'Guía de Tallas Calzado Mujer',
    'Medidas para zapatos de mujer',
    '["35", "36", "37", "38", "39", "40"]',
    '{
        "Largo pie (cm)": {"35": "22.5", "36": "23", "37": "23.5", "38": "24", "39": "24.5", "40": "25"},
        "EU": {"35": "35", "36": "36", "37": "37", "38": "38", "39": "39", "40": "40"},
        "US": {"35": "5", "36": "6", "37": "7", "38": "8", "39": "9", "40": "10"}
    }',
    'cm'
);
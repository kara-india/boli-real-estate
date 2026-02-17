-- Migration 017: Enable property boosting and apply to high-value listings
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
UPDATE properties
SET is_boosted = true
WHERE title LIKE '%Panoramic 3BHK%'
    OR title LIKE '%Luxury 4BHK%';
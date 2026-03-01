// backend_phase1/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Load static sample data
const areasGeo = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'areas.geojson'), 'utf8'));
const projectsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'projects.json'), 'utf8'));
const propertiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'properties.json'), 'utf8'));

// Helper to find area by id
function getAreaById(areaId) {
    return areasGeo.features.find(f => f.properties.area_id === areaId);
}

// Endpoint: GET /api/map/areas?center=mira-road
app.get('/api/map/areas', (req, res) => {
    // ignore center param for stub, return full collection
    res.json(areasGeo);
});

// Endpoint: GET /api/map/areas/:areaId/projects
app.get('/api/map/areas/:areaId/projects', (req, res) => {
    const { areaId } = req.params;
    const areaProjects = projectsData[areaId] || [];
    res.json({ area_id: areaId, projects: areaProjects });
});

// Endpoint: GET /api/properties/:id
app.get('/api/properties/:id', (req, res) => {
    const { id } = req.params;
    const prop = propertiesData[id];
    if (!prop) {
        return res.status(404).json({ error: 'Property not found' });
    }
    res.json(prop);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Phase‑1 backend listening on http://localhost:${PORT}`);
});

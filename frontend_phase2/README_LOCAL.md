# Phase 2: Frontend Map Base

## Setup Instructions

1. **Install Dependencies**
   Ensure you have installed the required libraries in the main Next.js repository root:
   ```cmd
   npm install @react-google-maps/api
   npm install -D jsdom
   ```

2. **Copy Components**
   Place `components/InteractiveMap.tsx` and `components/InteractiveMap.test.tsx` in your `/components` directory.
   Place `app/listings/page.tsx` in your `/app/listings/` directory (these files are included in this zip respecting folder structure).

3. **Provide Environment Variables**
   Ensure your `.env.local` or `.env` file at the repository root contains:
   ```env
   NEXT_PUBLIC_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY_OR_PLACEHOLDER
   ```

4. **Run Phase 1 Backend**
   Ensure the `backend_phase1` node app is running continuously at `http://localhost:3001` to serve the map layer GeoJSON and projects.

5. **Start frontend** (New terminal)
   ```cmd
   npm run dev
   ```
   Navigate to `http://localhost:3000/listings` (or whichever route matches).

## Verification Checks

- **Visual**: The map loads at the top, centering on Mira Road with 10 Gold-toned choropleth polygons.
- **Network**: When you click an area polygon, the browser network tab should display a successful fetch to `http://localhost:3001/api/map/areas/{id}/projects`. No markers are rendered yet per the Phase 2 spec.
- **Unit Tests**:
  You can verify the components using Vitest locally.
  ```cmd
  npx vitest run components/InteractiveMap.test.tsx
  ```
  The test report validates:
  1. Polygons render with loaded features and `data-color` matches `color_hex`.
  2. Clicking triggers the correct `fetch` URL for `/projects`.
  3. Base UI Layout renders perfectly without wait-jumps.

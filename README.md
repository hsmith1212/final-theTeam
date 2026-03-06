The Team Final Project- Exploring the Impact of Historic Redlining in Worcester
===

Links
---
Screen cast: https://www.youtube.com/watch?v=ogmw8-sb3cQ

Project website: https://hsmith1212.github.io/final-theTeam/

Process book: https://drive.google.com/file/d/1u-6lays6OiPB_vpxqdn8oxjUh9Bh-r59/view

Project Overview
---
Our project explores the impact of historic redlining in Worcester, Massachusetts. The visualization allows users to compare historic redlining zones with modern Worcester zip codes and demographic information. Users can click on map areas to see housing prices, income data, demographic breakdowns, and how much of each zip code overlaps with different redlining zones.

Files
---
### Website
index.html: Main webpage containing the map visualization and interface.

### JavaScript (Project Code)
redline_map.js: Draws the historic redlining zones on the map and allows users to click zones to view details.

zipcode_map.js: Draws Worcester zip code boundaries and allows users to click zip codes to see modern data.

map_projection.js: Creates a shared geographic projection so both maps align correctly.

opacity_change.js: Controls which map layer is currently in focus by adjusting opacity.

percentageOverlap.js: Calculates how much of each Worcester zip code overlaps with each historic redlining zone.

breakdown_graph.js: Creates the bar chart showing the percentage of redlining zones inside a selected zip code.

zip_demographics_chart.js: Creates a demographic chart showing race and ethnicity data for the selected zip code.

### Data Files
The data/ folder contains all datasets used in the visualization, including:
Historic redlining zones (GeoJSON)
Massachusetts zip code boundaries
Worcester zip code demographic data
Housing price and income data
Precomputed redlining overlap percentages

### Python Files
correlation_test.py: Used to analyze correlations between redlining zone percentages and median housing prices.

dev_server.py: Local development server used to run the project and properly load CSV and GeoJSON files.

Libraries
---
The project uses the following external libraries:
D3.js – for maps and data visualization
Turf.js – for spatial calculations such as polygon overlap

Interface Features
---
Map Focus Toggle: Users can switch between the Redlining Map and Zipcode Map using the radio buttons on the side panel.
Interactive Map: Clicking a redlining zone displays the zone description and classification from historic records.
Zipcode Information Panel
Clicking a zip code displays:
    - median housing price
    - median household income
    - redlining zone breakdown
    - demographic chart
Zoom and Pan: Users can zoom and pan the map to explore Worcester in more detail.

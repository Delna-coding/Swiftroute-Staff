<p align="center">
  <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000" alt="Project Banner" width="100%">
</p>

# SwiftRoute - Intelligent Kerala Bus Tracker 🎯

## Basic Details

### Team Name: Logic Craft

### Team Members
- Member 1: DELNA THERESE - SAINTGITS COLLEGE OF ENGINEERING KOTTAYAM
- Member 2: NIYAROSE SIJO - SAINTGITS COLLEGE OF ENGINEERING KOTTAYAM

### Hosted Project Link
[Project Link Placeholder]

### Project Description
SwiftRoute is a specialized transit management platform designed for the Kasaragod-Kottayam bus route. It provides conductors with real-time manifest control and leverages Gemini AI to forecast passenger occupancy at upcoming stops.

### The Problem statement
Bus conductors often struggle with tracking exact passenger counts across multiple stops, leading to overcapacity or missed revenue. Additionally, passengers have no way of knowing if a bus will have space by the time it reaches their stop.

### The Solution
A real-time digital manifest system that automates passenger offboarding and provides AI-driven occupancy predictions. This allows staff to manage tickets efficiently and provides data-driven insights into route demand.

---

## Technical Details

### Technologies/Components Used

**For Software:**
- Languages used: TypeScript, JavaScript
- Frameworks used: React 19
- Libraries used: @google/genai, lucide-react, Tailwind CSS
- Tools used: Gemini 3 Flash API, ESM.sh

---

## Features

List the key features of your project:
- **Staff-Only Portal**: Secure conductor login to manage the bus manifest.
- **Live Route Simulation**: SVG-based real-time tracking from Kasaragod to Kottayam with timed transitions and halts.
- **Intelligent Ticketing**: Smart boarding/destination filtering that prevents selection of past stops.
- **AI Occupancy Forecasting**: Integration with Gemini API to predict bus crowding based on current bookings and historical patterns.
- **Automated Manifest**: Automatic passenger offboarding when the bus reaches its destination stop.
- **Capacity Enforcement**: Hard limit of 55 passengers with "Tickets Not Available" status indicators.

---

## Implementation

### For Software:

#### Installation
```bash
npm install
```

#### Run
```bash
npm start
```

---

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

![Dashboard](https://images.unsplash.com/photo-1509010144297-576127185002?auto=format&fit=crop&q=80&w=600)
*Conductor Dashboard showing the live route map and passenger manifest.*

![AI Prediction](https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600)
*AI Forecasting tool using Gemini to predict upcoming stop occupancy.*

![Ticketing](https://images.unsplash.com/photo-1531050171669-7ae9b30c6d3f?auto=format&fit=crop&q=80&w=600)
*Manifest update tool with filtered boarding and destination stops.*

#### Diagrams

**System Architecture:**

SwiftRoute uses a client-side React architecture that communicates directly with the Google Gemini API for intelligent processing. Data state (Tickets, Bus Position) is managed via React hooks for high responsiveness.

**Application Workflow:**

Conductor Logins -> Map simulation begins -> Conductor adds passengers at current stop -> AI can be queried for future stops -> Passengers auto-offboard at destination.

---

## Project Demo

### Video
[Demo Video Link Placeholder]

*The video demonstrates the conductor logging in, adding a group of passengers, the bus moving between stops, and the AI forecast predicting future crowding.*

---

## AI Tools Used (Optional - For Transparency Bonus)

**Tool Used:** Google Gemini 3 Flash, v0.dev

**Purpose:**
- Generated logic for occupancy prediction using `@google/genai`.
- Debugging assistance for the SVG route interpolation logic.
- UI/UX design components using Tailwind CSS.

**Key Prompts Used:**
- "Predict the total number of passengers likely to be on the bus when it reaches target stop using Gemini AI."
- "Filter boarding and destination options to hide stops that have already been passed."
- "Create a responsive bus map component using SVG."

**Percentage of AI-generated code:** Approximately 35%

**Human Contributions:**
- Core application logic and state management.
- Business rule definitions (e.g., 55 passenger limit).
- Route data and stop coordinate mapping.
- Integration of staff authentication flow.

---

## Team Contributions

- DELNA THERESE: Frontend development, AI Integration, CSS Styling.
- NIYAROSE SIJO: Logic implementation, Documentation, Testing.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ at TinkerHub

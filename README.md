# Sanctuary: A Sociology of Religion Simulator

**Sanctuary** is an interactive idle/incremental management game designed to teach the core concepts of the sociology of religion through experiential gameplay.

Players take on the role of a founder leading a new religious movement. Starting from a humble "Circle of Seekers," they must navigate the tensions of institutionalization, boundary maintenance, and charismatic authority as they evolve into a Sect, Denomination, or Megachurch.

<div align="center">
<img width="1200" height="475" alt="Sanctuary Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🎓 Educational Goals

Sanctuary transforms abstract sociological theories into tangible game mechanics. Students experience:

*   **The Sacred & The Profane (Durkheim):** Classifying objects and encountering dynamic laws that redefine boundaries.
*   **Routinization of Charisma (Weber):** Experiencing how institutional legitimacy inevitably dampens spiritual "Awe."
*   **The Sacred Canopy (Berger):** Maintaining doctrinal consistency to protect the community from "anomie."
*   **Church-Sect Typology:** Choosing between social integration (Sect) and high-tension isolation (Cult).
*   **Collective Effervescence:** Engaging in synchronized rituals to generate shared emotional energy.

## 🕹️ Key Mechanics

*   **Five-Meter System:** Balance **Awe**, **Cohesion**, **Legitimacy**, **Purity**, and **Resources**. Neglecting any can lead to internal schisms, state crackdowns, or institutional "fade."
*   **Branching Progression:** Your early decisions determine if your movement remains a socially-integrated Sect or hardens into a high-tension Cult.
*   **Procedural Mini-Games:** 
    *   **Sacred Sorting:** Maintain group purity by classifying items under shifting religious laws.
    *   **Ritual Modes:** Perform Rhythm, Sequence, or Focus rituals to build solidarity (but watch out for Ritual Exhaustion).
    *   **Inner Circle:** Recruit and train disciples, establishing a global doctrine that rewards consistency.
*   **Bureaucracy Engine:** As the movement grows, manage the "Admin" phase with procedurally generated documents that force trade-offs between grandeur and legitimacy.

## 🛠️ Technical Setup

Sanctuary is a single-page React application built with **Vite**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

### Prerequisites
*   Node.js (v18+)
*   npm

### Local Development
1.  Clone the repository:
    ```bash
    git clone https://github.com/professorcaren/sanctuary.git
    cd sanctuary
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your [Google Gemini API Key](https://aistudio.google.com/app/apikey):
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🌐 Deployment & Integration

### Hosting
The project is optimized for hosting on **GitHub Pages**, **Vercel**, or **Cloud Run**. The `deploy.yml` workflow is included for automated GitHub Actions deployment.

### Leaderboard (Google Sheets)
Sanctuary uses a Google Sheets backend for its "Hall of Manifestations." To host your own:
1.  Copy the [leaderboard.gs](leaderboard.gs) script into a Google Apps Script project attached to a sheet.
2.  Deploy as a Web App with "Anyone, even anonymous" access.
3.  Update the `SCRIPT_URL` in `src/components/ui/GameOverModal.tsx`.

### AI Oracle Guide
The optional "Spirit Oracle" provides contextual hints using the Gemini API. It is enabled by providing the `VITE_GEMINI_API_KEY`.

## 📜 License & Citation

This project is designed for educational use. If you use Sanctuary in your curriculum or research, please cite:

> Caren, Neal. (2026). *Sanctuary: A Sociology of Religion Simulator*. [https://github.com/professorcaren/sanctuary](https://github.com/professorcaren/sanctuary)

---
*Built for the sociology classroom.*

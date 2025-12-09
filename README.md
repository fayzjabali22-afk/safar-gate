# Safar Gate - (بوابة سفر)

Welcome to **Safar Gate**, a progressive web application (PWA) designed to revolutionize the land transport market by connecting carriers (drivers, offices, companies) with travelers in a seamless, reliable, and intelligent ecosystem.

This project is built on the "Holy Approach" principle: to create the best PWA for smartphones, demonstrating that this technology is a superior, faster, and more advanced alternative to native store applications.

## Core Philosophy

The land transport market often suffers from a supply/demand imbalance. Our system acts as an intelligent market regulator, creating innovative mechanisms to increase opportunities for carriers and stimulate demand from travelers.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Deployment**: Firebase Hosting with GitHub Actions CI/CD
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (for smart suggestions)

## Key Features

### For Carriers
- **Opportunity Hub**: A centralized dashboard to view all trip requests, with smart filtering based on the carrier's preferred routes and vehicle capacity.
- **Dynamic Offers**: Submit detailed offers for trip requests, with AI-powered price suggestions.
- **Scheduled Trips**: Publish your own scheduled trips with fixed prices for direct booking by travelers.
- **Instant Booking Management**: Accept or reject booking requests for your scheduled trips with a single click.
- **Organized Communication**: Direct and group chat channels for seamless communication with travelers.
- **Emergency Protocol**: Transfer a confirmed trip and its passengers to a trusted colleague in case of an emergency, ensuring service continuity.

### For Travelers
- **Smart Search**: Find scheduled trips or submit a public/direct request to the market.
- **Clear Decision Making**: Receive and compare detailed offers from multiple carriers.
- **Secure Booking Flow**: A clear, step-by-step process from offer acceptance to deposit payment.
- **Direct Communication**: Chat directly with your carrier after booking confirmation.

## Getting Started

To run the project locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open the Application**:
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is configured for automatic deployment to Firebase Hosting via GitHub Actions. Any push to the `main` or `master` branch will trigger the deployment workflow defined in `.github/workflows/deploy.yml`.

# Financial Scenario Management Application

A modern React application for analyzing portfolio performance under different market scenarios. Built with React, TypeScript, Ant Design, and Recharts.

## Features

- **Portfolio Management**: Add, edit, and delete financial positions
- **Scenario Analysis**: Test portfolio performance under various market conditions
- **Visual Analytics**: Interactive charts showing portfolio distribution and impact analysis
- **Real-time Calculations**: Instant impact calculations for different market shocks
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Predefined Scenarios

- **Equity -5%**: Market downturn scenario
- **Equity +5%**: Market upturn scenario  
- **FX +2%**: Currency appreciation
- **Rates +50bps**: Interest rate increase
- **Custom**: Define your own market shock percentage

## Technologies Used

- **React 18** with TypeScript
- **Ant Design** for UI components
- **Recharts** for data visualization
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ScenarioManagment
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Usage

1. **Add Positions**: Click "Add Position" to add new financial instruments to your portfolio
2. **Select Scenario**: Choose from predefined scenarios or create a custom shock
3. **Run Simulation**: Click "Run Simulation" to calculate portfolio impact
4. **Analyze Results**: View detailed impact analysis with charts and tables

## Portfolio Features

- View total portfolio value and position count
- See portfolio distribution in pie chart format
- Analyze individual position impacts
- Track total portfolio impact as percentage

## Customization

The application is built with modularity in mind. You can easily:

- Add new scenario types in the `SCENARIOS` array
- Modify the UI theme by updating Ant Design configuration
- Extend the position data model for additional fields
- Add new chart types using Recharts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details

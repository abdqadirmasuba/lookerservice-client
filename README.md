# Looker Service Client

A React Native application built with Expo, TypeScript, and NativeWind (Tailwind CSS).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Running the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 🎨 Styling with NativeWind

This project uses NativeWind v4, which brings Tailwind CSS to React Native. You can use Tailwind classes directly in your components:

```tsx
<View className="flex-1 bg-blue-500 items-center justify-center">
  <Text className="text-white text-2xl font-bold">Hello World</Text>
</View>
```

## 📁 Project Structure

```
lookerservice-client/
├── assets/           # Images, fonts, and other static assets
├── components/       # Reusable UI components
├── constants/        # App-wide constants and configuration
├── screens/          # Screen components
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main app component
├── global.css        # Global Tailwind styles
└── metro.config.js   # Metro bundler configuration
```

## 🛠️ Technologies

- **Expo**: Framework for React Native apps
- **TypeScript**: Type-safe JavaScript
- **NativeWind**: Tailwind CSS for React Native
- **React Native**: Mobile app framework

## 📝 TypeScript Configuration

The project includes:
- Strict mode enabled
- Image type declarations for PNG, JPG, SVG, etc.
- NativeWind type support
- Path aliases configured (@/* for root imports)

## 🎯 Next Steps

1. Configure your API endpoint in `constants/index.ts`
2. Add your screens in the `screens/` directory
3. Create reusable components in `components/`
4. Add your assets to the `assets/` directory

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

import { Text, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
  };

  return (
    <View
      className={`${variantClasses[variant]} px-6 py-3 rounded-lg active:opacity-80`}
      onTouchEnd={onPress}
    >
      <Text className="text-white font-semibold text-center">
        {title}
      </Text>
    </View>
  );
}

import { useState } from 'react';
import { Text } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface Props {
  uri: string | null | undefined;
  size?: number;
  fallback?: string;
}

export default function SvgIcon({ uri, size = 40, fallback = '🛠️' }: Props) {
  const [error, setError] = useState(false);

  if (error || !uri) {
    return <Text style={{ fontSize: size * 0.7 }}>{fallback}</Text>;
  }

  return (
    <SvgUri
      width={size}
      height={size}
      uri={uri}
      onError={() => setError(true)}
    />
  );
}

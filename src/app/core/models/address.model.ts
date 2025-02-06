export interface Address {
  street: string;
  district: string;
  city: string;
  postalCode: string;
}

export function formatAddress(address: Address): string {
  return `${address.street}, ${address.district}, ${address.city}, ${address.postalCode}`;
}

export function parseAddress(addressString: string): Partial<Address> {
  const parts = addressString.split(',').map(part => part.trim());
  return {
    street: parts[0] || '',
    district: parts[1] || '',
    city: parts[2] || '',
    postalCode: parts[3] || ''
  };
} 
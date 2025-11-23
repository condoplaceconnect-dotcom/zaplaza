import ProfileHeader from '../ProfileHeader';

export default function ProfileHeaderExample() {
  return (
    <div className="p-4 space-y-4">
      <ProfileHeader
        name="João Silva"
        unit="301"
        onEdit={() => console.log('Edit profile')}
      />
      
      <ProfileHeader
        name="Maria Santos"
        unit="405"
        isVendor
        storeName="Doces da Maria"
        category="Sobremesas"
        rating={4.8}
        reviewCount={127}
        onEdit={() => console.log('Edit vendor profile')}
      />
    </div>
  );
}

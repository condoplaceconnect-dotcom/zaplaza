import HeroBanner from '../HeroBanner';
import heroBannerImg from '@assets/generated_images/marketplace_hero_banner.png';

export default function HeroBannerExample() {
  const banners = [
    {
      id: '1',
      image: heroBannerImg,
      title: 'Compre de vizinhos',
      subtitle: 'Produtos frescos direto do seu condomínio'
    },
    {
      id: '2',
      image: heroBannerImg,
      title: 'Entrega rápida',
      subtitle: 'Receba em minutos, sem sair de casa'
    }
  ];

  return (
    <div className="p-4">
      <HeroBanner banners={banners} />
    </div>
  );
}

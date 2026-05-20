import { Construction } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <PageContainer>
      <div className="placeholder-page">
        <div className="placeholder-page__icon">
          <Construction size={48} />
        </div>
        <h2 className="placeholder-page__title">{title}</h2>
        <p className="placeholder-page__desc">
          {description ?? `The ${title} section is under development. Check back soon!`}
        </p>
      </div>
    </PageContainer>
  );
}

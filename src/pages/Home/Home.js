import { Activity, ArrowUpRight, Boxes, CircleCheck, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Home.css';

const summaryCards = [
  {
    label: 'Itens cadastrados',
    value: '128',
    detail: 'Visão ilustrativa',
    Icon: Boxes,
    tone: 'green',
  },
  {
    label: 'Atividades recentes',
    value: '12',
    detail: 'Últimos 7 dias',
    Icon: Activity,
    tone: 'blue',
  },
  {
    label: 'Status da conta',
    value: 'Ativa',
    detail: 'Tudo em ordem',
    Icon: CircleCheck,
    tone: 'amber',
  },
];

function Home() {
  const { user } = useAuth();

  return (
    <section className="home-page">
      <div className="home-page__heading">
        <div>
          <p className="home-page__eyebrow">VISÃO GERAL</p>
          <h1>Dashboard</h1>
          <p className="home-page__welcome">
            Olá, {user?.displayName}. Aqui está um resumo do seu espaço.
          </p>
        </div>
        <span className="home-page__period">Seu espaço de trabalho</span>
      </div>

      <div className="home-page__cards">
        {summaryCards.map(({ label, value, detail, Icon, tone }) => (
          <article className="home-card" key={label}>
            <div className="home-card__top">
              <span className={`home-card__icon home-card__icon--${tone}`}>
                <Icon aria-hidden="true" size={19} />
              </span>
              <ArrowUpRight aria-hidden="true" className="home-card__arrow" size={17} />
            </div>
            <p className="home-card__label">{label}</p>
            <p className="home-card__value">{value}</p>
            <p className="home-card__detail">{detail}</p>
          </article>
        ))}
      </div>

      <article className="home-welcome-card">
        <div className="home-welcome-card__icon">
          <Users aria-hidden="true" size={21} />
        </div>
        <div>
          <h2>Seu espaço está pronto</h2>
          <p>Use o menu lateral para acessar o cadastro de itens. Os indicadores acima são demonstrativos.</p>
        </div>
      </article>
    </section>
  );
}

export default Home;

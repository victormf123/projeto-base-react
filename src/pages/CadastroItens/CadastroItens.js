import { Boxes } from 'lucide-react';
import './CadastroItens.css';

function CadastroItens() {
  return (
    <section className="items-page">
      <p className="items-page__eyebrow">ESPAÇO DE TRABALHO</p>
      <h1>Cadastro de Itens</h1>
      <p className="items-page__description">
        Esta área está reservada para o futuro formulário de cadastro.
      </p>
      <div className="items-page__placeholder">
        <span className="items-page__icon">
          <Boxes aria-hidden="true" size={22} />
        </span>
        <h2>Em preparação</h2>
        <p>O conteúdo de cadastro será disponibilizado aqui em uma próxima etapa.</p>
      </div>
    </section>
  );
}

export default CadastroItens;

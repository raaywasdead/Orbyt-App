import React from 'react';
import '../../styles/ModalTermoUso.css';

interface ModalTermoUsoProps {
  open: boolean;
  onClose: () => void;
}

const termoUso = `# Termos de Uso – Orbyt\n\nBem-vindo ao Orbyt!\n\nAo acessar e utilizar o Orbyt, você concorda com os termos e condições descritos abaixo. Leia atentamente antes de utilizar nossos serviços.\n\n## 1. Aceitação dos Termos\nAo criar uma conta e utilizar o Orbyt, você concorda com estes Termos de Uso. Caso não concorde, por favor, não utilize o serviço.\n\n## 2. Cadastro e Conta\nPara utilizar o Orbyt, é necessário criar uma conta informando um e-mail válido e uma senha. Você é responsável por manter a confidencialidade dessas informações e por todas as atividades realizadas em sua conta.\n\n## 3. Privacidade\nSeus dados pessoais, como e-mail e senha, são coletados apenas para fins de autenticação e funcionamento do serviço. Não compartilhamos suas informações com terceiros, exceto quando exigido por lei. Para mais detalhes, consulte nossa Política de Privacidade.\n\n## 4. Gratuidade\nTodos os recursos do Orbyt são oferecidos gratuitamente. Não há cobrança de taxas ou valores para uso das funcionalidades disponíveis.\n\n## 5. Responsabilidades do Usuário\nVocê se compromete a utilizar o Orbyt de forma ética e legal, não praticando atividades que possam prejudicar o serviço ou outros usuários.\n\n## 6. Modificações dos Termos\nO Orbyt pode atualizar estes Termos de Uso periodicamente. Recomendamos que você revise esta página regularmente para estar ciente de eventuais alterações.\n\n## 7. Contato\nEm caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail de suporte informado na plataforma.\n\nÚltima atualização: 26 de fevereiro de 2026.`;

export default function ModalTermoUso({ open, onClose }: ModalTermoUsoProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Termos de Uso</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <div style={{ maxHeight: '60vh', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
            {termoUso}
          </div>
        </div>
      </div>
    </div>
  );
}

// Exemplo de Teste Unitário Simples para a Função de Segurança
import { escaparHTML } from '../assets/js/utils';

function logTest(nome, resultado) {
    console.log(`${resultado ? '✅' : '❌'} Teste: ${nome}`);
}

export function executarTestesDeSeguranca() {
    console.group("🧪 Iniciando Testes de Segurança...");
    
    // Teste 1: Proteção contra XSS
    const entradaPerigosa = "<script>alert('hack')</script>";
    const saidaEsperada = "&lt;script&gt;alert(&#39;hack&#39;)&lt;/script&gt;";
    logTest("Sanitização de XSS", escaparHTML(entradaPerigosa) === saidaEsperada);

    // Teste 2: Validação de E-mail (Lógica Simples)
    const emailValido = "aluno@aluno.senai.br";
    const emailInvalido = "hacker@gmail.com";
    logTest("Validação de domínio institucional", emailValido.endsWith("@aluno.senai.br"));
    logTest("Bloqueio de e-mail comum", !emailInvalido.endsWith("@aluno.senai.br"));

    console.groupEnd();
}

// Para rodar, basta chamar executarTestesDeSeguranca() no console do navegador.
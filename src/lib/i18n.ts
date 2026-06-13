
import { useEffect, useState } from "react";

const LANG_KEY = "petis:lang";

type Lang = "pt" | "en";

const dictionary = {
  pt: {
    "app.title": "Petis",
    "app.description": "Gerencie a rotina, agenda, vacinas e bem-estar do seu pet em um único lugar.",
    "app.title.long": "Petis — Rotina e saúde do seu pet",
    "app.description.long": "Gerencie a rotina, agenda, vacinas e bem-estar do seu pet em um único lugar.",
    "not.found.title": "Página não encontrada",
    "not.found.description": "A página que você está procurando não existe ou foi movida.",
    "go.home": "Voltar para o início",
    "error.page.title": "Esta página não carregou",
    "error.page.description": "Algo deu errado do nosso lado. Você pode tentar atualizar ou voltar para o início.",
    "try.again": "Tentar novamente",
    "loading": "Carregando Petis...",
    "open.settings.menu.label": "Abrir menu de configurações",
    "logout.label": "Sair",
    "confirm.logout.title": "Deseja mesmo sair do aplicativo?",
    "confirm.logout.description": "Você precisará inserir suas credenciais novamente para acessar os dados do seu pet.",
    "confirm.logout.label": "Sim, Sair",
    "logout.success.message": "Sessão encerrada.",
    "hello.owner": "Olá, tutor do",
    "todays.reminders": "Lembretes de Hoje",
    settings: "Configurações",
    "edit.profile": "Editar Perfil",
    "welcome.to.petis": "Bem-vindo ao Petis!",
    "welcome.start": "Para começar a acompanhar a rotina de saúde e bem-estar do seu amigo, você precisa cadastrar o seu primeiro pet.",
    "add.pet": "Cadastrar Meu Pet",
    "local.storage.notice": "Suas informações ficam salvas apenas neste dispositivo.",
    "daily.summary": "Resumo do dia",
    "care.summary": (done: number, total: number) => `${done} de ${total} cuidados`,
    "all.good": "Tudo em dia! ✨",
    "keep.it.up": "Continue cuidando bem do seu pet.",
    "add.reminder.to.start": "Adicione um lembrete para começar.",
    "quick.actions": "Ações rápidas",
    vaccine: "Vacina",
    appointment: "Compromisso",
    weight: "Peso",
    "new.reminder": "Novo Lembrete",
    "no.reminders.today": "Nenhum lembrete para hoje.",
    "add.new.reminder.prompt": "Toque em + Novo Lembrete para adicionar.",
    completed: "Concluído",
    pending: "Pendente",
    "new.reminder.dialog.title": "Novo lembrete",
    "new.reminder.dialog.description": "Adicione rapidamente um cuidado para a rotina do seu pet.",
    "activity.label": "Atividade",
    "activity.placeholder": "Ex.: Dar ração, Passear",
    "time.label": "Horário",
    "repetition.label": "Repetição",
    "repetition.once": "Apenas hoje",
    "repetition.daily": "Todos os dias",
    cancel: "Cancelar",
    save: "Salvar",
    "account.section": "Conta",
    "my.profile": "Meu Perfil",
    "basic.settings.section": "Configurações básicas",
    language: "Idioma",
    "language.hint": "Português (BR)",
    "help.center": "Central de Ajuda / FAQ",
    "terms.of.use": "Termos de Uso",
    "logout.button": "Sair da conta",
    "petis.version": "Petis · v1.0",
    "edit.profile.dialog.title": "Meu perfil",
    "edit.profile.dialog.description": "Atualize seus dados pessoais. As alterações ficam salvas neste dispositivo.",
    "change.photo.button": "Trocar foto",
    "remove.photo.button": "Remover",
    "full.name.label": "Nome completo",
    "phone.label": "Telefone",
    "email.label": "E-mail",
    "save.changes.button": "Salvar alterações",
    "language.dialog.title": "Idioma",
    "language.dialog.description": "Selecione o idioma do aplicativo.",
    "lang.pt-BR": "🇧🇷 Português (Brasil)",
    "lang.en-US": "🇺🇸 English (US)",
    "lang.es-ES": "🇪🇸 Español",
    "active.language": "Ativo",
    "faq.dialog.title": "Central de Ajuda · FAQ",
    "faq.dialog.description": "Respostas para as dúvidas mais comuns.",
    "terms.dialog.title": "Termos de Uso",
    "terms.dialog.description": "Resumo simplificado para este protótipo.",
    close: "Fechar",
    "credentials.section": "🔒 Alterar Credenciais de Acesso",
    "change.email.label": "Mudar E-mail",
    "change.password.label": "Mudar Senha",
    "old.password.label": "Senha Antiga",
    "new.password.label": "Nova Senha",
    "confirm.new.password.label": "Confirmar Nova Senha",
    "wrong.old.password.error": "❌ Senha antiga incorreta.",
    "password.mismatch.error": "As senhas não conferem.",
    "verification.code.sent.title": "📧 Código de Verificação Enviado!",
    "verification.code.sent.description": "Inserimos um código de 6 dígitos no seu novo e-mail para confirmar a alteração.",
    "verification.code.label": "Código de Verificação",
    "confirm.button": "Confirmar",
    "faq.q1": "Como cadastrar um novo pet?",
    "faq.a1": "Na tela inicial, toque em + Cadastrar Meu Pet. No perfil você pode adicionar mais pets pelo botão +.",
    "faq.q2": "Onde meus dados ficam armazenados?",
    "faq.a2": "Todos os dados ficam neste dispositivo (localStorage). Nada é enviado para servidores.",
    "faq.q3": "Como recebo lembretes de vacinas?",
    "faq.a3": "Ao registrar uma vacina com data da próxima dose, o app mostrará alertas na aba Vacinas.",
    "faq.q4": "Posso compartilhar a ficha médica?",
    "faq.a4": "Sim! No perfil do pet, toque em Compartilhar Ficha Médica para gerar um resumo pronto.",
    "terms.p1.start": "O",
    "terms.p1.end": "é um protótipo educacional para gestão da rotina, saúde e bem-estar do seu pet. Ao usar o aplicativo você concorda que:",
    "terms.li1": "Os dados ficam salvos apenas neste dispositivo (localStorage).",
    "terms.li2": "O app não substitui consulta veterinária profissional.",
    "terms.li3": "Você é responsável pelas informações inseridas no sistema.",
    "terms.li4": "Limpar o cache do navegador apaga permanentemente todos os seus dados cadastrados.",
    "terms.p2": "Última atualização: junho de 2026.",
  },
  en: {
    "app.title": "Petis",
    "app.description": "Manage your pet\'s routine, schedule, vaccines, and well-being in one place.",
    "app.title.long": "Petis — Your pet\'s health and routine",
    "app.description.long": "Manage your pet\'s routine, schedule, vaccines, and well-being in one place.",
    "not.found.title": "Page not found",
    "not.found.description": "The page you\'re looking for doesn\'t exist or has been moved.",
    "go.home": "Go home",
    "error.page.title": "This page didn\'t load",
    "error.page.description": "Something went wrong on our end. You can try refreshing or head back home.",
    "try.again": "Try again",
    "loading": "Loading Petis...",
    "open.settings.menu.label": "Open settings menu",
    "logout.label": "Log out",
    "confirm.logout.title": "Do you really want to log out?",
    "confirm.logout.description": "You will need to enter your credentials again to access your pet\'s data.",
    "confirm.logout.label": "Yes, Log out",
    "logout.success.message": "Session ended.",
    "hello.owner": "Hello, owner of",
    "todays.reminders": "Today\'s Reminders",
    settings: "Settings",
    "edit.profile": "Edit Profile",
    "welcome.to.petis": "Welcome to Petis!",
    "welcome.start": "To start tracking your friend\'s health and wellness routine, you need to register your first pet.",
    "add.pet": "Add My Pet",
    "local.storage.notice": "Your information is saved only on this device.",
    "daily.summary": "Daily summary",
    "care.summary": (done: number, total: number) => `${done} of ${total} cares`,
    "all.good": "All up to date! ✨",
    "keep.it.up": "Keep taking good care of your pet.",
    "add.reminder.to.start": "Add a reminder to get started.",
    "quick.actions": "Quick actions",
    vaccine: "Vaccine",
    appointment: "Appointment",
    weight: "Weight",
    "new.reminder": "New Reminder",
    "no.reminders.today": "No reminders for today.",
    "add.new.reminder.prompt": "Tap + New Reminder to add one.",
    completed: "Completed",
    pending: "Pending",
    "new.reminder.dialog.title": "New reminder",
    "new.reminder.dialog.description": "Quickly add a care to your pet\'s routine.",
    "activity.label": "Activity",
    "activity.placeholder": "E.g.: Feed, Walk",
    "time.label": "Time",
    "repetition.label": "Repetition",
    "repetition.once": "Just today",
    "repetition.daily": "Every day",
    cancel: "Cancel",
    save: "Save",
    "account.section": "Account",
    "my.profile": "My Profile",
    "basic.settings.section": "Basic settings",
    language: "Language",
    "language.hint": "English (US)",
    "help.center": "Help Center / FAQ",
    "terms.of.use": "Terms of Use",
    "logout.button": "Log out",
    "petis.version": "Petis · v1.0",
    "edit.profile.dialog.title": "My profile",
    "edit.profile.dialog.description": "Update your personal data. Changes are saved on this device.",
    "change.photo.button": "Change photo",
    "remove.photo.button": "Remove",
    "full.name.label": "Full name",
    "phone.label": "Phone",
    "email.label": "E-mail",
    "save.changes.button": "Save changes",
    "language.dialog.title": "Language",
    "language.dialog.description": "Select the application language.",
    "lang.pt-BR": "🇧🇷 Português (Brasil)",
    "lang.en-US": "🇺🇸 English (US)",
    "lang.es-ES": "🇪🇸 Español",
    "active.language": "Active",
    "faq.dialog.title": "Help Center · FAQ",
    "faq.dialog.description": "Answers to the most common questions.",
    "terms.dialog.title": "Terms of Use",
    "terms.dialog.description": "Simplified summary for this prototype.",
    close: "Close",
    "credentials.section": "🔒 Change Access Credentials",
    "change.email.label": "Change Email",
    "change.password.label": "Change Password",
    "old.password.label": "Old Password",
    "new.password.label": "New Password",
    "confirm.new.password.label": "Confirm New Password",
    "wrong.old.password.error": "❌ Incorrect old password.",
    "password.mismatch.error": "Passwords do not match.",
    "verification.code.sent.title": "📧 Verification Code Sent!",
    "verification.code.sent.description": "We have sent a 6-digit code to your new email to confirm the change.",
    "verification.code.label": "Verification Code",
    "confirm.button": "Confirm",
    "faq.q1": "How to register a new pet?",
    "faq.a1": "On the home screen, tap + Add My Pet. In the profile you can add more pets with the + button.",
    "faq.q2": "Where is my data stored?",
    "faq.a2": "All data is stored on this device (localStorage). Nothing is sent to servers.",
    "faq.q3": "How do I get vaccine reminders?",
    "faq.a3": "When you register a vaccine with a next dose date, the app will show alerts on the Vaccines tab.",
    "faq.q4": "Can I share the medical record?",
    "faq.a4": "Yes! In the pet\'s profile, tap Share Medical Record to generate a ready-made summary.",
    "terms.p1.start": "The",
    "terms.p1.end": "is an educational prototype for managing your pet\'s routine, health, and well-being. By using the app you agree that:",
    "terms.li1": "The data is saved only on this device (localStorage).",
    "terms.li2": "The app does not replace professional veterinary consultation.",
    "terms.li3": "You are responsible for the information entered into the system.",
    "terms.li4": "Clearing the browser cache permanently deletes all your registered data.",
    "terms.p2": "Last update: June 2026.",
  },
};

const langListeners = new Set<() => void>();

function getInitialLang(): Lang {
    if (typeof window === "undefined") return "pt";
    return (localStorage.getItem(LANG_KEY) as Lang | null) ?? "pt";
}

let currentLang: Lang = getInitialLang();

export function useLanguage() {
  const [lang, setLang] = useState(currentLang);

  useEffect(() => {
    const l = () => setLang(currentLang);
    langListeners.add(l);
    return () => {
      langListeners.delete(l);
    };
  }, []);

  const setLanguage = (newLang: Lang) => {
    currentLang = newLang;
    localStorage.setItem(LANG_KEY, newLang);
    langListeners.forEach((l) => l());
  };

  return { lang, setLanguage };
}

export function t<K extends keyof (typeof dictionary)[Lang]>(
  key: K,
  ...args: (typeof dictionary)[Lang][K] extends (...args: any[]) => string
    ? Parameters<(typeof dictionary)[Lang][K]>
    : []
): string {
    const translation = dictionary[currentLang][key];
    if (typeof translation === "function") {
        return (translation as any)(...args);
    }
    return translation;
}

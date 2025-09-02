// Variáveis globais
let currentUser = null;
let activityCount = 1;

// Inicialização
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    checkAuthStatus();
    setupEventListeners();
    registerServiceWorker();
}

// Verificar status de autenticação
function checkAuthStatus() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('email').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Activity form events
    setupActivityFormEvents();
}

// Registrar Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
}

// Manipular login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validação simples
    if (!email.endsWith('@funase.pe.gov.br')) {
        showError('Use apenas e-mails @funase.pe.gov.br');
        return;
    }
    
    if (password !== 'funase2024') {
        showError('Senha incorreta');
        return;
    }
    
    // Login bem-sucedido
    currentUser = email;
    
    if (rememberMe) {
        localStorage.setItem('rememberedUser', email);
    }
    
    showMainContent();
    showSection('welcomeSection');
}

// Mostrar conteúdo principal após login
function showMainContent() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainNav').style.display = 'block';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userInfo').textContent = currentUser;
    
    // Mostrar funcionalidades administrativas para usuários específicos
    if (currentUser === 'cultura@funase.pe.gov.br') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
}

// Manipular navegação
function handleNavigation(e) {
    const sectionId = e.target.dataset.section;
    showSection(sectionId);
}

// Mostrar seção específica
function showSection(sectionId) {
    // Ocultar todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar seção solicitada
    document.getElementById(sectionId).style.display = 'block';
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Manipular logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rememberedUser');
    
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainNav').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// Configurar eventos do formulário de atividade
function setupActivityFormEvents() {
    // Adicionar atividade
    document.getElementById('addActivityBtn').addEventListener('click', addNewActivity);
    
    // Salvar atividade
    document.getElementById('saveActivityBtn').addEventListener('click', saveActivity);
    
    // Enviar atividade
    document.getElementById('submitActivityBtn').addEventListener('click', submitActivity);
    
    // Outros eventos...
}

// Adicionar nova atividade
function addNewActivity() {
    activityCount++;
    const activityForm = document.getElementById('activityForm').cloneNode(true);
    activityForm.id = `activityForm-${activityCount}`;
    
    // Atualizar IDs e eventos
    // ... (código para atualizar os IDs e eventos dos elementos clonados)
    
    document.getElementById('activitiesContainer').appendChild(activityForm);
}

// Salvar atividade
function saveActivity() {
    const activityData = gatherActivityData();
    // Salvar no localStorage
    const savedActivities = JSON.parse(localStorage.getItem('savedActivities') || '[]');
    savedActivities.push(activityData);
    localStorage.setItem('savedActivities', JSON.stringify(savedActivities));
    
    showNotification('Atividade salva com sucesso!', 'success');
}

// Coletar dados da atividade
function gatherActivityData() {
    return {
        id: Date.now(),
        date: document.getElementById('activityDate').value,
        type: document.getElementById('activityType').value,
        // Coletar outros dados do formulário...
    };
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Mostrar erro
function showError(message) {
    showNotification(message, 'error');
}
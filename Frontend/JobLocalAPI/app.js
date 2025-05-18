document.addEventListener('DOMContentLoaded', function() {
    const BASE_API_URL = 'http://localhost:5000/api';
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    function toggleUserType() {
        const workerBtn = document.getElementById('worker-btn');
        const employerBtn = document.getElementById('employer-btn');
        const workerFields = document.getElementById('worker-fields');

        if (workerBtn && employerBtn) {
            [workerBtn, employerBtn].forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    workerBtn.classList.toggle('active', btn === workerBtn);
                    employerBtn.classList.toggle('active', btn === employerBtn);
                    if (workerFields) workerFields.style.display = btn === workerBtn ? 'block' : 'none';
                    document.getElementById('user-type').value = btn === workerBtn ? 'worker' : 'employer';
                });
            });
        }
    }

    async function handleRegistration(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cadastrando...';

        const formData = {
            name: form.querySelector('#name').value.trim(),
            email: form.querySelector('#email').value.trim(),
            phone: form.querySelector('#phone').value.trim(),
            password: form.querySelector('#password').value,
            userType: form.querySelector('#user-type').value,
            location: form.querySelector('#location').value.trim(),
            skills: form.querySelector('#skills')?.value.trim(),
            description: form.querySelector('#description')?.value.trim()
        };

        if (formData.password !== form.querySelector('#confirm-password').value) {
            showFeedback('As senhas não coincidem', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Quero me cadastrar';
            return;
        }

        try {
            const response = await fetch(`${BASE_API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erro no cadastro');

            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = `${formData.userType}-dashboard.html`;
        } catch (error) {
            showFeedback(error.message, 'error');
            console.error('Registration Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Quero me cadastrar';
        }
    }

    async function handleJobPost(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publicando...';

        const formData = {
            title: form.querySelector('#service-title').value.trim(),
            categoryId: parseInt(form.querySelector('#service-category').value),
            description: form.querySelector('#service-description').value.trim(),
            location: form.querySelector('#service-location').value.trim(),
            scheduledDate: form.querySelector('#service-date').value,
            price: parseFloat(form.querySelector('#service-budget').value) || null,
            workerId: parseInt(form.querySelector('#worker-select').value) || null,
            contactPreference: form.querySelector('input[name="contact-preference"]:checked').value
        };

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Necessário fazer login');

            const response = await fetch(`${BASE_API_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erro ao publicar');

            showFeedback('Oportunidade publicada com sucesso!', 'success');
            setTimeout(() => window.location.href = 'employer-dashboard.html', 1500);
        } catch (error) {
            showFeedback(error.message, 'error');
            console.error('Job Post Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Oportunidade';
        }
    }

    async function handleJobSearch(e) {
        e.preventDefault();
        const form = e.target;
        const searchBtn = form.querySelector('button[type="submit"]');
        
        searchBtn.disabled = true;
        searchBtn.textContent = 'Buscando...';

        const params = new URLSearchParams({
            status: 'posted',
            ...(form.querySelector('#job-category').value && {category: form.querySelector('#job-category').value}),
            ...(form.querySelector('#job-location').value && {location: form.querySelector('#job-location').value.trim()})
        });

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Necessário fazer login');

            const response = await fetch(`${BASE_API_URL}/jobs?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Erro na busca');

            renderJobs(data);
        } catch (error) {
            showFeedback(error.message, 'error');
            console.error('Job Search Error:', error);
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Buscar Oportunidades';
        }
    }

    function renderJobs(jobs) {
        const container = document.querySelector('.job-listings');
        if (!container) return;

        container.innerHTML = jobs.length 
            ? '<h3>Oportunidades Disponíveis</h3>'
            : '<p class="no-jobs">Nenhuma oportunidade encontrada</p>';

        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <div class="job-info">
                    <h4>${escapeHTML(job.title)}</h4>
                    <p class="job-category">${escapeHTML(job.category?.name || 'Geral')}</p>
                    <p class="job-description">${escapeHTML(job.description)}</p>
                    <p class="job-location">📍 ${escapeHTML(job.location)}</p>
                    ${job.price ? `<p class="job-price">R$ ${job.price.toFixed(2)}</p>` : ''}
                    ${job.scheduledDate ? `<p class="job-date">⏰ ${new Date(job.scheduledDate).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="job-actions">
                    <button class="btn-primary" data-job-id="${job.id}">Ver Detalhes</button>
                </div>
            `;
            container.appendChild(jobCard);
        });

        container.querySelectorAll('.job-actions .btn-primary').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = `job-details.html?id=${btn.dataset.jobId}`;
            });
        });
    }

    function escapeHTML(str) {
        return str ? str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            "'": '&#39;', '"': '&quot;'
        }[tag])) : '';
    }

    function showFeedback(message, type) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback ${type}`;
        feedbackEl.textContent = message;
        document.body.appendChild(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 5000);
    }

    function checkAuth() {
        if (!currentUser && window.location.pathname.includes('dashboard')) {
            window.location.href = 'login.html';
        }
    }

    function initEventListeners() {
        toggleUserType();
        
        const registerForm = document.getElementById('register-form');
        if (registerForm) registerForm.addEventListener('submit', handleRegistration);
        
        const hireForm = document.getElementById('hire-form');
        if (hireForm) hireForm.addEventListener('submit', handleJobPost);
        
        const jobSearchForm = document.querySelector('.search-form');
        if (jobSearchForm) jobSearchForm.addEventListener('submit', handleJobSearch);
    }

    checkAuth();
    initEventListeners();
});
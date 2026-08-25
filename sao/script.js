document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 0;
    const totalSteps = 6;
    let uploadedAvatarBase64 = "";

    const stepScreens = {
        0: document.getElementById('step-0'),
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4'),
        5: document.getElementById('step-5'),
        6: document.getElementById('step-6')
    };

    const mainHeader = document.getElementById('main-header');
    const navBar = document.getElementById('nav-bar');
    const btnBack = document.getElementById('btn-back');
    const btnContinue = document.getElementById('btn-continue');
    const btnBegin = document.getElementById('btn-begin');
    const btnProceedEula = document.getElementById('btn-proceed-eula');
    const btnDownload = document.getElementById('btn-download');

    // Upload de Imagem de Avatar
    const avatarUploadInput = document.getElementById('avatarUpload');
    const avatarImagePreview = document.getElementById('avatarImagePreview');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');

    runBootSequence();
    autoFillMetadata();

    btnBegin.addEventListener('click', () => goToStep(1));
    btnBack.addEventListener('click', () => navigate(-1));
    btnContinue.addEventListener('click', () => navigate(1));
    btnProceedEula.addEventListener('click', () => goToStep(5));
    btnDownload.addEventListener('click', exportPurchaseAgreement);

    // Manipulação do Upload da Imagem
    avatarUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedAvatarBase64 = event.target.result;
                avatarImagePreview.src = uploadedAvatarBase64;
                avatarImagePreview.classList.remove('hidden');
                avatarPlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    function goToStep(targetStep) {
        if (targetStep < 0 || targetStep > totalSteps) return;

        if (targetStep > currentStep && !validateCurrentStep()) return;

        stepScreens[currentStep].classList.add('hidden');
        currentStep = targetStep;
        stepScreens[currentStep].classList.remove('hidden');

        if (currentStep === 0) {
            mainHeader.classList.add('hidden');
            navBar.classList.add('hidden');
        } else if (currentStep === 4 || currentStep === 6) {
            mainHeader.classList.remove('hidden');
            navBar.classList.add('hidden');
            if (currentStep === 4) runSystemDiagnostics();
            if (currentStep === 6) updateSummaryCard();
        } else {
            mainHeader.classList.remove('hidden');
            navBar.classList.remove('hidden');
        }

        updateStepIndicator();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function navigate(direction) {
        goToStep(currentStep + direction);
    }

    function updateStepIndicator() {
        btnBack.disabled = currentStep <= 1;

        const dots = document.querySelectorAll('.step-dot');
        dots.forEach((dot) => {
            const stepNum = parseInt(dot.getAttribute('data-step'));
            dot.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                dot.classList.add('active');
            } else if (stepNum < currentStep) {
                dot.classList.add('completed');
            }
        });
    }

    function validateCurrentStep() {
        if (currentStep === 1) {
            const fullName = document.getElementById('fullName').value.trim();
            const preferredName = document.getElementById('preferredName').value.trim();
            const age = document.getElementById('age').value;

            if (!fullName || !preferredName || !age) {
                alert('Por favor, preencha todos os campos obrigatórios de Identidade (*).');
                return false;
            }
        }

        if (currentStep === 5) {
            const eulaAgree = document.getElementById('eulaAgree').checked;
            const digitalSignature = document.getElementById('digitalSignature').value.trim();
            const fullName = document.getElementById('fullName').value.trim();

            if (!eulaAgree) {
                alert('Você precisa aceitar os termos do Contrato de Usuário.');
                return false;
            }
            if (!digitalSignature) {
                alert('Por favor, digite sua Assinatura Digital.');
                return false;
            }
            if (digitalSignature.toLowerCase() !== fullName.toLowerCase()) {
                alert(`A Assinatura Digital deve ser exatamente igual ao seu Nome Completo ("${fullName}").`);
                return false;
            }
        }
        return true;
    }

    function runBootSequence() {
        let progress = 0;
        const progressBar = document.getElementById('boot-progress');
        const progressPercentage = document.getElementById('boot-percentage');
        const splashTitles = document.getElementById('splash-titles');
        const bootStatus = document.getElementById('boot-status');

        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 3;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                bootStatus.textContent = 'Sistema pronto';
                setTimeout(() => {
                    document.querySelector('.terminal-loader').classList.add('hidden');
                    splashTitles.classList.remove('hidden');
                }, 400);
            }
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
        }, 80);
    }

    function runSystemDiagnostics() {
        const statuses = [
            { id: 'proc-identity', text: 'Verificado' },
            { id: 'proc-avatar', text: 'Registrado' },
            { id: 'proc-combat', text: 'Configurado' },
            { id: 'proc-preferences', text: 'Salvo' },
            { id: 'proc-objectives', text: 'Registrado' },
            { id: 'proc-nervegear', text: 'Confirmado' }
        ];

        statuses.forEach((item, index) => {
            setTimeout(() => {
                const el = document.getElementById(item.id).querySelector('.status-value');
                el.textContent = item.text;
                el.style.color = '#58dfd3';
                if (index === statuses.length - 1) {
                    btnProceedEula.classList.remove('hidden');
                }
            }, (index + 1) * 400);
        });
    }

    function autoFillMetadata() {
        const today = new Date().toISOString().split('T')[0];
        const randomId = 'ARGUS-SAO-' + Math.floor(100000 + Math.random() * 900000);

        document.getElementById('regDate').value = today;
        document.getElementById('regId').value = randomId;
    }

    function updateSummaryCard() {
        document.getElementById('summaryName').textContent = document.getElementById('fullName').value || '---';
        document.getElementById('summaryId').textContent = document.getElementById('regId').value || '---';
    }

    function getSelectedCheckboxes(containerId) {
        const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    function collectFormData() {
        return {
            meta: {
                registrationId: document.getElementById('regId').value,
                registrationDate: document.getElementById('regDate').value,
                systemVersion: "Argus FullDive OS v4.2"
            },
            playerIdentity: {
                fullName: document.getElementById('fullName').value,
                preferredName: document.getElementById('preferredName').value,
                age: document.getElementById('age').value,
                birthday: document.getElementById('birthday').value,
                pronouns: document.getElementById('pronouns').value,
                country: document.getElementById('country').value
            },
            avatarProfile: {
                avatarImageBase64: uploadedAvatarBase64,
                hairColor: document.getElementById('hairColor').value,
                hairStyle: document.getElementById('hairStyle').value,
                eyeColor: document.getElementById('eyeColor').value,
                skinTone: document.getElementById('skinTone').value,
                height: document.getElementById('height').value,
                build: document.getElementById('build').value,
                distinguishingFeatures: document.getElementById('distinguishingFeatures').value,
                description: document.getElementById('appearanceDesc').value
            },
            personality: {
                selfDescription: document.getElementById('selfDescription').value,
                strengths: document.getElementById('strengths').value,
                weaknesses: document.getElementById('weaknesses').value,
                motivations: document.getElementById('motivations').value,
                reactionUnderPressure: document.getElementById('reactionUnderPressure').value
            },
            combatProfile: {
                selectedWeapons: getSelectedCheckboxes('weapon-options'),
                primaryWeapon: document.getElementById('primaryWeapon').value,
                combatStyles: getSelectedCheckboxes('style-options'),
                combatDescription: document.getElementById('combatDescription').value,
                gameClass: document.getElementById('gameClass').value
            },
            progressionAndRole: {
                interestedRoles: getSelectedCheckboxes('role-options'),
                interestedRolesExtra: document.getElementById('interestedRoles-extra').value,
                specializationBalance: document.getElementById('specializationSlider').value,
                rareAbilitiesImportance: document.querySelector('input[name="rareRating"]:checked')?.value || '3'
            },
            worldExpectations: {
                activities: getSelectedCheckboxes('world-activities'),
                disappointments: document.getElementById('disappointments').value,
                hopeForFeatures: document.getElementById('mustExist').value,
                storyPreference: document.getElementById('storyPreference').value
            },
            personalGoals: {
                firstGoal: document.getElementById('firstGoal').value,
                highestFloorMotivation: document.getElementById('highestFloorMotivation').value,
                socialPreference: document.getElementById('socialPreference').value,
                desiredCompanions: document.getElementById('desiredCompanions').value,
                antiTargetPersona: document.getElementById('antiTargetPersona').value,
                riskLifeFactor: document.getElementById('riskLifeFactor').value,
                refuseToFightFactor: document.getElementById('refuseToFightFactor').value,
                additionalNotes: document.getElementById('additionalNotes').value
            },
            agreement: {
                digitalSignature: document.getElementById('digitalSignature').value,
                acceptedTerms: document.getElementById('eulaAgree').checked
            }
        };
    }

    // Funções auxiliares de sanitização e formatação
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatText(str) {
        if (!str || !str.trim()) return '<span class="text-muted">Não informado</span>';
        return escapeHtml(str).replace(/\n/g, '<br>');
    }

    function renderChips(arr) {
        if (!arr || arr.length === 0) return '<span class="text-muted">Nenhum selecionado</span>';
        return arr.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join(' ');
    }

    /* ----------------------------------------------------------------------
       GERAÇÃO DO DOSSIÊ COMPLETO COM ESTILO IDENTICO AO FORMULÁRIO (GITHUB DARK)
       ---------------------------------------------------------------------- */
    function exportPurchaseAgreement() {
        const data = collectFormData();
        const rawName = data.playerIdentity.preferredName || data.playerIdentity.fullName || 'Jogador';
        const safeFileName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `SAO_Registro_${safeFileName}.html`;

        const avatarImgTag = data.avatarProfile.avatarImageBase64 
            ? `<img src="${data.avatarProfile.avatarImageBase64}" alt="Avatar" class="avatar-img">`
            : `<div class="avatar-placeholder-box">Sem Foto de Jogador</div>`;

        const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro do jogador: ${escapeHtml(rawName)}</title>
    <style>
        :root {
            --color-canvas-default: #0d1117;
            --color-canvas-subtle: #161b22;
            --color-canvas-inset: #010409;
            --color-border-default: #30363d;
            --color-border-muted: #21262d;
            
            --color-fg-default: #e6edf3;
            --color-fg-muted: #848d97;
            --color-fg-subtle: #6e7681;
            
            --color-accent-fg: #98b4db;
            --color-accent-emphasis: #85b6ff;
            --color-accent-subtle: rgba(56, 139, 253, 0.15);
            
            --color-success-fg: #58dfd3;
            
            --font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            --radius-default: 6px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
            background-color: var(--color-canvas-default); 
            color: var(--color-fg-default); 
            font-family: var(--font-stack); 
            font-size: 14px; 
            line-height: 1.5; 
            padding: 32px 16px; 
        }
        
        .document-card { 
            max-width: 900px; 
            margin: 0 auto; 
            background: var(--color-canvas-subtle); 
            border: 1px solid var(--color-border-default); 
            border-radius: var(--radius-default); 
            padding: 24px; 
        }
        
        .header { 
            border-bottom: 1px solid var(--color-border-muted); 
            padding-bottom: 16px; 
            margin-bottom: 20px; 
        }
        .header h1 { 
            font-size: 20px; 
            font-weight: 600; 
            color: var(--color-fg-default); 
        }
        .header p { 
            color: var(--color-accent-fg); 
            font-weight: 600; 
            font-size: 11px; 
            margin-top: 2px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
        }
        .status-badge { 
            display: inline-block; 
            background: rgba(46, 160, 67, 0.15); 
            border: 1px solid var(--color-success-fg); 
            color: var(--color-success-fg); 
            padding: 2px 8px; 
            font-weight: 600; 
            border-radius: 12px; 
            font-size: 11px; 
            margin-top: 10px; 
        }

        .section-title { 
            font-size: 14px; 
            font-weight: 600; 
            color: var(--color-fg-default); 
            border-bottom: 1px solid var(--color-border-muted); 
            padding-bottom: 6px; 
            margin-top: 24px; 
        }

        .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
        .grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 12px; }

        .field { 
            background: var(--color-canvas-default); 
            padding: 8px 12px; 
            border-radius: var(--radius-default); 
            border: 1px solid var(--color-border-default); 
        }
        .field.full { grid-column: 1 / -1; }
        .label { 
            font-size: 11px; 
            color: var(--color-fg-muted); 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
        }
        .val { 
            font-size: 14px; 
            font-weight: 500; 
            color: var(--color-fg-default); 
            margin-top: 2px; 
            word-break: break-word; 
        }
        .text-muted { color: var(--color-fg-muted); font-style: italic; }

        .profile-header-box { display: flex; gap: 16px; align-items: flex-start; margin-top: 12px; }
        .avatar-img { width: 140px; height: 160px; border: 1px solid var(--color-border-default); border-radius: var(--radius-default); object-fit: cover; }
        .avatar-placeholder-box { width: 140px; height: 160px; border: 1px dashed var(--color-border-default); border-radius: var(--radius-default); display: flex; align-items: center; justify-content: center; color: var(--color-fg-muted); font-size: 12px; text-align: center; padding: 8px; background: var(--color-canvas-default); }

        .chip { 
            display: inline-block; 
            padding: 4px 10px; 
            background: var(--color-accent-subtle); 
            border: 1px solid rgba(56, 139, 253, 0.4); 
            color: var(--color-accent-fg); 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 500; 
            margin: 2px 2px 2px 0; 
        }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: var(--color-fg-muted); border-top: 1px solid var(--color-border-muted); padding-top: 16px; }

        @media (max-width: 650px) {
            .profile-header-box { flex-direction: column; align-items: center; }
            .grid-2col, .grid-3col { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="document-card">
        <div class="header">
            <p>Registro de Jogador</p>
            <h1>SWORD ART ONLINE</h1>
            <div><span class="status-badge">Licença Ativa · Registro Confirmado</span></div>
        </div>

        <!-- 01. IDENTIDADE -->
        <div class="section-title">01. Identidade e Registro</div>
        <div class="profile-header-box">
            <div>${avatarImgTag}</div>
            <div style="flex:1; width: 100%;">
                <div class="grid-2col" style="margin-top:0;">
                    <div class="field"><div class="label">Nome Completo</div><div class="val">${formatText(data.playerIdentity.fullName)}</div></div>
                    <div class="field"><div class="label">Apelido / Nome de Preferência</div><div class="val">${formatText(data.playerIdentity.preferredName)}</div></div>
                    <div class="field"><div class="label">Idade / Data de Nascimento</div><div class="val">${escapeHtml(data.playerIdentity.age || '-')} anos (${escapeHtml(data.playerIdentity.birthday || 'N/A')})</div></div>
                    <div class="field"><div class="label">Pronomes / País</div><div class="val">${formatText(data.playerIdentity.pronouns)} / ${formatText(data.playerIdentity.country)}</div></div>
                    <div class="field full"><div class="label">ID de Registro</div><div class="val">${escapeHtml(data.meta.registrationId)}</div></div>
                </div>
            </div>
        </div>

        <!-- 02. APARÊNCIA -->
        <div class="section-title">02. Atributos Visuais do Jogador</div>
        <div class="grid-3col">
            <div class="field"><div class="label">Cabelo</div><div class="val">${formatText(data.avatarProfile.hairColor)} (${formatText(data.avatarProfile.hairStyle)})</div></div>
            <div class="field"><div class="label">Olhos / Tom de Pele</div><div class="val">${formatText(data.avatarProfile.eyeColor)} / ${formatText(data.avatarProfile.skinTone)}</div></div>
            <div class="field"><div class="label">Altura / Porte Físico</div><div class="val">${formatText(data.avatarProfile.height)} / ${formatText(data.avatarProfile.build)}</div></div>
            <div class="field full"><div class="label">Marcas Distintivas</div><div class="val">${formatText(data.avatarProfile.distinguishingFeatures)}</div></div>
            <div class="field full"><div class="label">Descrição Visual do Jogador</div><div class="val">${formatText(data.avatarProfile.description)}</div></div>
        </div>

        <!-- 03. PSICOMÉTRICO -->
        <div class="section-title">03. Perfil Psicométrico</div>
        <div class="grid-2col">
            <div class="field full"><div class="label">Auto-descrição</div><div class="val">${formatText(data.personality.selfDescription)}</div></div>
            <div class="field"><div class="label">Pontos Fortes</div><div class="val">${formatText(data.personality.strengths)}</div></div>
            <div class="field"><div class="label">Fraquezas / Vulnerabilidades</div><div class="val">${formatText(data.personality.weaknesses)}</div></div>
            <div class="field"><div class="label">Motivações</div><div class="val">${formatText(data.personality.motivations)}</div></div>
            <div class="field"><div class="label">Reação sob Pressão</div><div class="val">${formatText(data.personality.reactionUnderPressure)}</div></div>
        </div>

        <!-- 04. COMBATE -->
        <div class="section-title">04. Combate e Progressão</div>
        <div class="grid-2col">
            <div class="field full"><div class="label">Armas de Interesse</div><div class="val">${renderChips(data.combatProfile.selectedWeapons)}</div></div>
            <div class="field"><div class="label">Arma Principal</div><div class="val">${formatText(data.combatProfile.primaryWeapon)}</div></div>
            <div class="field"><div class="label">Classe Planejada</div><div class="val">${formatText(data.combatProfile.gameClass)}</div></div>
            <div class="field full"><div class="label">Estilos de Luta</div><div class="val">${renderChips(data.combatProfile.combatStyles)}</div></div>
            <div class="field full"><div class="label">Descrição do Estilo de Luta</div><div class="val">${formatText(data.combatProfile.combatDescription)}</div></div>
            <div class="field full"><div class="label">Roles / Profissões de Interesse</div><div class="val">${renderChips(data.progressionAndRole.interestedRoles)}</div></div>
            <div class="field"><div class="label">Outro Caminho de Progressão</div><div class="val">${formatText(data.progressionAndRole.interestedRolesExtra)}</div></div>
            <div class="field"><div class="label">Versatilidade (Slider)</div><div class="val">${escapeHtml(data.progressionAndRole.specializationBalance)}% Versátil</div></div>
            <div class="field full"><div class="label">Importância de Habilidades Raras</div><div class="val">${escapeHtml(data.progressionAndRole.rareAbilitiesImportance)} / 5</div></div>
        </div>

        <!-- 05. EXPECTATIVAS E OBJETIVOS -->
        <div class="section-title">05. Expectativas e Objetivos em Aincrad</div>
        <div class="grid-2col">
            <div class="field full"><div class="label">Atividades Desejadas</div><div class="val">${renderChips(data.worldExpectations.activities)}</div></div>
            <div class="field"><div class="label">O que Decepcionaria</div><div class="val">${formatText(data.worldExpectations.disappointments)}</div></div>
            <div class="field"><div class="label">O que Espera Encontrar</div><div class="val">${formatText(data.worldExpectations.hopeForFeatures)}</div></div>
            <div class="field full"><div class="label">História Desejada</div><div class="val">${formatText(data.worldExpectations.storyPreference)}</div></div>
            <div class="field"><div class="label">Primeiro Objetivo ao Entrar</div><div class="val">${formatText(data.personalGoals.firstGoal)}</div></div>
            <div class="field"><div class="label">Motivação para Alcançar o Topo</div><div class="val">${formatText(data.personalGoals.highestFloorMotivation)}</div></div>
            <div class="field"><div class="label">Preferência de Exploração</div><div class="val">${formatText(data.personalGoals.socialPreference)}</div></div>
            <div class="field"><div class="label">Companheiros Desejados</div><div class="val">${formatText(data.personalGoals.desiredCompanions)}</div></div>
            <div class="field"><div class="label">Pessoa que NUNCA Gostaria de Se Tornar</div><div class="val">${formatText(data.personalGoals.antiTargetPersona)}</div></div>
            <div class="field"><div class="label">Faria Arriscar a Vida</div><div class="val">${formatText(data.personalGoals.riskLifeFactor)}</div></div>
            <div class="field full"><div class="label">Faria Recusar a Lutar</div><div class="val">${formatText(data.personalGoals.refuseToFightFactor)}</div></div>
            <div class="field full"><div class="label">Notas Adicionais</div><div class="val">${formatText(data.personalGoals.additionalNotes)}</div></div>
        </div>

        <!-- 06. ASSINATURA -->
        <div class="section-title">06. Termo de Aceite e Validação</div>
        <div class="grid-2col">
            <div class="field"><div class="label">Assinatura Digital</div><div class="val">${formatText(data.agreement.digitalSignature)}</div></div>
            <div class="field"><div class="label">Data de Emissão</div><div class="val">${escapeHtml(data.meta.registrationDate)}</div></div>
        </div>

        <div class="footer">
            Argus Systems Co., Ltd. &copy; 2026. Todos os direitos reservados.<br>
            Documento de Registro FullDive gerado automaticamente.
        </div>
    </div>

    <!-- ESTRUTURA JSON EMBUTIDA PARA PARSING AUTOMÁTICO -->
    <script id="sao-player-data" type="application/json">
        ${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')}
    </script>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

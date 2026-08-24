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
            { id: 'proc-nervegear', text: 'Online e pronto' }
        ];

        statuses.forEach((item, index) => {
            setTimeout(() => {
                const el = document.getElementById(item.id).querySelector('.status-value');
                el.textContent = item.text;
                el.style.color = '#10b981';
                if (index === statuses.length - 1) {
                    btnProceedEula.classList.remove('hidden');
                }
            }, (index + 1) * 500);
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
                systemVersion: "Argus FullDive OS"
            },
            playerIdentity: {
                fullName: document.getElementById('fullName').value,
                preferredName: document.getElementById('preferredName').value,
                age: document.getElementById('age').value,
                birthday: document.getElementById('birthday').value,
                pronouns: document.getElementById('pronouns').value,
                country: document.getElementById('country').value,
                timeZone: document.getElementById('timeZone').value
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

    /* ----------------------------------------------------------------------
       GERAÇÃO DO DOSSIÊ COMPLETO (VISÍVEL NO NAVEGADOR PARA O MESTRE)
       ---------------------------------------------------------------------- */
    function exportPurchaseAgreement() {
        const data = collectFormData();
        const playerName = data.playerIdentity.preferredName || data.playerIdentity.fullName || 'Jogador';
        const fileName = `SAO_Registro_${playerName.replace(/\s+/g, '_')}.html`;

        const avatarImgTag = data.avatarProfile.avatarImageBase64 
            ? `<img src="${data.avatarProfile.avatarImageBase64}" style="max-width:200px; max-height:220px; border:1px solid #97c2e3; border-radius:12px; object-fit:cover;">`
            : `<div style="width:160px; height:180px; border:1px dashed rgba(151,194,227,0.4); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#8fa1b8; font-size:13px;">Sem foto do avatar</div>`;

        const renderList = (arr) => arr.length > 0 ? arr.map(i => `<span class="chip">${i}</span>`).join(' ') : '<span class="text-muted">Nenhum selecionado</span>';

        const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Sword Art Online — Dossiê do jogador</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
        body { background: radial-gradient(ellipse 80% 50% at 50% 0%, #16233a 0%, #0c1420 55%); color: #e9eef6; font-family: 'Rajdhani', sans-serif; padding: 30px; margin: 0; line-height: 1.5; }
        .document-card { max-width: 900px; margin: 0 auto; background: rgba(24, 37, 58, 0.6); border: 1px solid rgba(151, 194, 227, 0.16); border-radius: 16px; padding: 36px; backdrop-filter: blur(16px); }
        .header { text-align: center; border-bottom: 1px solid rgba(151, 194, 227, 0.2); padding-bottom: 20px; margin-bottom: 25px; }
        .header h1 { font-family: 'Orbitron', sans-serif; font-size: 30px; margin: 0; color: #ffffff; letter-spacing: 1px; }
        .header p { color: #8fcbe8; font-weight: 600; margin-top: 6px; font-size: 14px; }
        .status-badge { display: inline-block; background: rgba(127, 208, 163, 0.14); border: 1px solid #7fd0a3; color: #7fd0a3; padding: 4px 14px; font-weight: 700; border-radius: 20px; font-size: 12px; }

        .section-title { font-weight: 700; font-size: 15px; color: #d9b878; border-bottom: 1px solid rgba(151, 194, 227, 0.18); padding-bottom: 6px; margin-top: 30px; }

        .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 12px; }
        .grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 12px; }

        .field { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid rgba(151, 194, 227, 0.1); }
        .field.full { grid-column: 1 / -1; }
        .label { font-size: 12px; color: #8fa1b8; font-weight: 600; }
        .val { font-size: 16px; font-weight: 600; color: #ffffff; margin-top: 4px; }
        .text-muted { color: #8fa1b8; }

        .profile-header-box { display: flex; gap: 20px; align-items: center; margin-top: 15px; }
        .chip { display: inline-block; background: rgba(143, 203, 232, 0.12); border: 1px solid rgba(143, 203, 232, 0.4); color: #fff; padding: 3px 11px; border-radius: 12px; font-size: 13px; margin: 2px; }
        .footer { text-align: center; margin-top: 40px; font-size: 13px; color: #8fa1b8; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; }
    </style>
</head>
<body>
    <div class="document-card">
        <div class="header">
            <h1>Sword Art Online</h1>
            <p>Argus Systems — Dossiê de registro de jogador</p>
            <div style="margin-top: 12px;"><span class="status-badge">Licença ativa · Conexão autorizada</span></div>
        </div>

        <!-- 1. Identidade e registro -->
        <div class="section-title">01 · Identidade e registro</div>
        <div class="profile-header-box">
            <div>${avatarImgTag}</div>
            <div style="flex:1;">
                <div class="grid-2col" style="margin-top:0;">
                    <div class="field"><div class="label">Nome Completo</div><div class="val">${data.playerIdentity.fullName || '-'}</div></div>
                    <div class="field"><div class="label">Apelido / Nome do Avatar</div><div class="val">${data.playerIdentity.preferredName || '-'}</div></div>
                    <div class="field"><div class="label">Idade / Aniversário</div><div class="val">${data.playerIdentity.age || '-'} anos (${data.playerIdentity.birthday || 'N/A'})</div></div>
                    <div class="field"><div class="label">Pronomes</div><div class="val">${data.playerIdentity.pronouns || '-'}</div></div>
                    <div class="field"><div class="label">ID de Registro</div><div class="val">${data.meta.registrationId}</div></div>
                </div>
            </div>
        </div>

        <!-- 2. APARÊNCIA DO AVATAR -->
        <div class="section-title">02 · Atributos visuais do avatar</div>
        <div class="grid-3col">
            <div class="field"><div class="label">Cabelo</div><div class="val">${data.avatarProfile.hairColor || '-'} (${data.avatarProfile.hairStyle || '-'})</div></div>
            <div class="field"><div class="label">Olhos / Tom de Pele</div><div class="val">${data.avatarProfile.eyeColor || '-'} / ${data.avatarProfile.skinTone || '-'}</div></div>
            <div class="field"><div class="label">Altura / Porte Físico</div><div class="val">${data.avatarProfile.height || '-'} / ${data.avatarProfile.build || '-'}</div></div>
            <div class="field full"><div class="label">Marcas Distintivas</div><div class="val">${data.avatarProfile.distinguishingFeatures || 'Nenhuma'}</div></div>
            <div class="field full"><div class="label">Descrição Visual</div><div class="val">${data.avatarProfile.description || 'Sem descrição adicional.'}</div></div>
        </div>

        <!-- 3. PERFIL PSICOMÉTRICO -->
        <div class="section-title">03 · Perfil psicométrico</div>
        <div class="grid-2col">
            <div class="field full"><div class="label">Auto-descrição</div><div class="val">${data.personality.selfDescription || '-'}</div></div>
            <div class="field"><div class="label">Pontos Fortes</div><div class="val">${data.personality.strengths || '-'}</div></div>
            <div class="field"><div class="label">Fraquezas</div><div class="val">${data.personality.weaknesses || '-'}</div></div>
            <div class="field"><div class="label">Motivações</div><div class="val">${data.personality.motivations || '-'}</div></div>
            <div class="field"><div class="label">Reação sob Pressão</div><div class="val">${data.personality.reactionUnderPressure || '-'}</div></div>
        </div>

        <!-- 4. PERFIL DE COMBATE E PROGRESSÃO -->
        <div class="section-title">04 · Combate e progressão</div>
        <div class="grid-2col">
            <div class="field full"><div class="label">Armas de Interesse</div><div class="val">${renderList(data.combatProfile.selectedWeapons)}</div></div>
            <div class="field"><div class="label">Arma Principal</div><div class="val">${data.combatProfile.primaryWeapon || '-'}</div></div>
            <div class="field"><div class="label">Estilos de Luta</div><div class="val">${renderList(data.combatProfile.combatStyles)}</div></div>
            <div class="field full"><div class="label">Descrição do Estilo de Luta</div><div class="val">${data.combatProfile.combatDescription || '-'}</div></div>
            <div class="field"><div class="label">Classe</div><div class="val">${data.combatProfile.gameClass || '-'}</div></div>
            <div class="field full"><div class="label">Roles / Funções de Interesse</div><div class="val">${renderList(data.progressionAndRole.interestedRoles)}</div></div>
            <div class="field"><div class="label">Outro Caminho de Progressão</div><div class="val">${data.progressionAndRole.interestedRolesExtra || '-'}</div></div>
            <div class="field"><div class="label">Especialização vs Versatilidade</div><div class="val">${data.progressionAndRole.specializationBalance}% Versátil</div></div>
            <div class="field"><div class="label">Importância de Habilidades Raras</div><div class="val">${data.progressionAndRole.rareAbilitiesImportance} / 5</div></div>
        </div>

        <!-- 5. EXPECTATIVAS DE MUNDO E OBJETIVOS -->
        <div class="section-title">05 · Expectativas e objetivos em Aincrad</div>
        <div class="grid-2col">
            <div class="field full"><div class="label">Atividades Desejadas</div><div class="val">${renderList(data.worldExpectations.activities)}</div></div>
            <div class="field"><div class="label">O que o Decepcionaria</div><div class="val">${data.worldExpectations.disappointments || '-'}</div></div>
            <div class="field"><div class="label">O que Realmente Espera Encontrar</div><div class="val">${data.worldExpectations.hopeForFeatures || '-'}</div></div>
            <div class="field full"><div class="label">História Desejada</div><div class="val">${data.worldExpectations.storyPreference || '-'}</div></div>
            <div class="field"><div class="label">Primeiro Objetivo ao Entrar</div><div class="val">${data.personalGoals.firstGoal || '-'}</div></div>
            <div class="field"><div class="label">Motivação para Alcançar o Topo</div><div class="val">${data.personalGoals.highestFloorMotivation || '-'}</div></div>
            <div class="field"><div class="label">Preferência de Exploração</div><div class="val">${data.personalGoals.socialPreference || '-'}</div></div>
            <div class="field"><div class="label">Companheiros Desejados</div><div class="val">${data.personalGoals.desiredCompanions || '-'}</div></div>
            <div class="field"><div class="label">Pessoa que Nunca Quer Ser</div><div class="val">${data.personalGoals.antiTargetPersona || '-'}</div></div>
            <div class="field"><div class="label">Faria Arriscar a Vida</div><div class="val">${data.personalGoals.riskLifeFactor || '-'}</div></div>
            <div class="field full"><div class="label">Faria Recusar a Lutar</div><div class="val">${data.personalGoals.refuseToFightFactor || '-'}</div></div>
            <div class="field full"><div class="label">Notas Adicionais do Jogador</div><div class="val">${data.personalGoals.additionalNotes || 'Nenhuma nota adicional.'}</div></div>
        </div>

        <!-- 6. ASSINATURA DIGITAL -->
        <div class="section-title">06 · Assinatura e validação</div>
        <div class="grid-2col">
            <div class="field"><div class="label">Assinatura Digital do Usuário</div><div class="val">${data.agreement.digitalSignature}</div></div>
            <div class="field"><div class="label">Data do Termo de Aceite</div><div class="val">${data.meta.registrationDate}</div></div>
        </div>

        <div class="footer">
            Argus Systems Co., Ltd. &copy; 2026. Todos os direitos reservados.<br>
            Documento gerado para sincronização de hardware FullDive.
        </div>
    </div>

    <!-- ESTRUTURA JSON EMBUTIDA -->
    <script id="sao-player-data" type="application/json">
        ${JSON.stringify(data, null, 2)}
    </script>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
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

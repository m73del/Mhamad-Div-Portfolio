// ==========================================
// 1. إخفاء شاشة التحميل فوراً (بدون انتظار)
// ==========================================
const loader = document.getElementById("loader");
if (loader) {
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 400);
  }, 300);
}

// البدء بتنفيذ باقي الوظائف بعد تحميل العناصر
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 2. نظام تفعيل الثيم (Dark / Light Mode)
  // ==========================================
  const themeToggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("bo3dil_theme") || "dark";

  if (currentTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  }

  themeToggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    
    if (isLight) {
      localStorage.setItem("bo3dil_theme", "light");
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      localStorage.setItem("bo3dil_theme", "dark");
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  });

  // ==========================================
  // 3. إدارة المشاريع والتخزين المحلي
  // ==========================================
  let projects = [];
  try {
    projects = JSON.parse(localStorage.getItem("bo3dil_projects")) || [];
  } catch (e) {
    projects = [];
  }

  const projectForm = document.getElementById("project-form");
  const projectsGrid = document.getElementById("projects-grid");
  const statCount = document.getElementById("stat-count");

  function saveAndRender() {
    localStorage.setItem("bo3dil_projects", JSON.stringify(projects));
    renderProjects();
  }

  function renderProjects() {
    if (statCount) statCount.textContent = projects.length;
    if (!projectsGrid) return;
    projectsGrid.innerHTML = "";

    if (projects.length === 0) {
      projectsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">لا يوجد مشاريع حالياً. أضف مشروعك الأول من النموذج أعلاه!</p>`;
      return;
    }

    projects.forEach((proj, index) => {
      const card = document.createElement("div");
      card.className = "glass-card project-card";
      
      const hasCode = proj.code && proj.code.trim() !== "";

      card.innerHTML = `
        <img src="${proj.image}" class="project-img" alt="${proj.title}">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.desc}</p>
        
        <div class="project-actions">
          <button class="action-btn" onclick="likeProject(${index})"><i class="fa-solid fa-thumbs-up"></i> ${proj.likes || 0}</button>
          <button class="action-btn" onclick="dislikeProject(${index})"><i class="fa-solid fa-thumbs-down"></i> ${proj.dislikes || 0}</button>
          ${hasCode ? `<button class="action-btn" onclick="viewCode(${index})"><i class="fa-solid fa-code"></i> الكود</button>` : ''}
          <button class="action-btn" onclick="shareProject('${proj.title}')"><i class="fa-solid fa-share-nodes"></i> نشر</button>
          <button class="action-btn delete-btn" onclick="deleteProject(${index})"><i class="fa-solid fa-trash"></i> حذف</button>
        </div>

        <div class="comments-container">
          <div class="comments-list">
            ${(proj.comments || []).map(c => `<div class="comment-item">${c}</div>`).join("")}
          </div>
          <div style="display:flex; gap:8px; margin-top: 8px;">
            <input type="text" id="comment-input-${index}" placeholder="اكتب تعليقاً..." style="flex:1; padding:8px 12px; font-size: 0.85rem;">
            <button class="action-btn" onclick="addComment(${index})">تعليق</button>
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  // إضافة مشروع جديد (حقل الكود اختياري)
  projectForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    if (projects.length >= 10) {
      alert("عذراً، الحد الأقصى للمشاريع المسموح باستضافتها هو 10 مشاريع فقط.");
      return;
    }

    const titleInput = document.getElementById("project-title");
    const descInput = document.getElementById("project-desc");
    const codeInput = document.getElementById("project-code");
    const imgInput = document.getElementById("project-image");

    if (!titleInput || !descInput || !imgInput) return;

    const title = titleInput.value;
    const desc = descInput.value;
    const code = codeInput ? codeInput.value : "";
    
    if (!imgInput.files || imgInput.files.length === 0) {
      alert("يرجى اختيار صورة للمشروع!");
      return;
    }

    const imgFile = imgInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function (event) {
      const newProject = {
        title,
        desc,
        code,
        image: event.target.result,
        likes: 0,
        dislikes: 0,
        comments: []
      };
      projects.unshift(newProject);
      saveAndRender();
      projectForm.reset();
      alert("تم نشر المشروع بنجاح! 🚀");
    };
    reader.readAsDataURL(imgFile);
  });

  window.likeProject = (index) => {
    projects[index].likes = (projects[index].likes || 0) + 1;
    saveAndRender();
  };

  window.dislikeProject = (index) => {
    projects[index].dislikes = (projects[index].dislikes || 0) + 1;
    saveAndRender();
  };

  window.deleteProject = (index) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المشروع؟")) {
      projects.splice(index, 1);
      saveAndRender();
    }
  };

  window.addComment = (index) => {
    const input = document.getElementById(`comment-input-${index}`);
    if (input && input.value.trim() !== "") {
      if (!projects[index].comments) projects[index].comments = [];
      projects[index].comments.push(input.value.trim());
      saveAndRender();
    }
  };

  window.shareProject = (title) => {
    navigator.clipboard.writeText(window.location.href);
    alert(`تم نسخ رابط الموقع لمشاركة مشروع "${title}"!`);
  };

  // ==========================================
  // 4. نافذة تعديل وعرض الكود البرمجي
  // ==========================================
  const codeModal = document.getElementById("code-modal");
  const modalCodeEditor = document.getElementById("modal-code-editor");
  const saveCodeBtn = document.getElementById("save-code-btn");
  const closeCodeModalBtn = document.querySelector(".close-code-modal");
  let currentEditIndex = null;

  if (codeModal && modalCodeEditor && saveCodeBtn) {
    window.viewCode = (index) => {
      currentEditIndex = index;
      modalCodeEditor.value = projects[index].code || "";
      codeModal.style.display = "flex";
    };

    saveCodeBtn.addEventListener("click", () => {
      if (currentEditIndex !== null) {
        projects[currentEditIndex].code = modalCodeEditor.value;
        saveAndRender();
        codeModal.style.display = "none";
      }
    });

    if (closeCodeModalBtn) {
      closeCodeModalBtn.onclick = () => codeModal.style.display = "none";
    }
    
    window.onclick = (event) => {
      if (event.target === codeModal) {
        codeModal.style.display = "none";
      }
    };
  }

  // ==========================================
  // 5. نظام الآدمن وتسجيل الدخول والبروفايل
  // ==========================================
  const loginForm = document.getElementById("login-form");
  const avatarEditLabel = document.getElementById("avatar-edit-label");
  const loginNavBtn = document.querySelector(".login-btn");

  let isAdminLoggedIn = localStorage.getItem("bo3dil_is_admin") === "true";

  function updateAdminUI() {
    if (avatarEditLabel) {
      avatarEditLabel.style.display = isAdminLoggedIn ? "flex" : "none";
    }
    if (!loginNavBtn) return;

    if (isAdminLoggedIn) {
      loginNavBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> تسجيل الخروج`;
    } else {
      loginNavBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> تسجيل الدخول`;
    }
  }

  updateAdminUI();

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const usernameInput = loginForm.querySelector("input[type='text']");
    const passwordInput = loginForm.querySelector("input[type='password']");

    if (!usernameInput || !passwordInput) return;

    if (usernameInput.value === "M.Code737" && passwordInput.value === "​zK9#vL7!mP$2026") {
      isAdminLoggedIn = true;
      localStorage.setItem("bo3dil_is_admin", "true");
      updateAdminUI();
      loginForm.reset();
      alert("أهلاً بك يا معلم Bo3Dil! تم تفعيل صلاحيات التعديل.");
      window.location.href = "index.html";
    } else {
      alert("بيانات الدخول غير صحيحة! الميزة مخصصة للآدمن فقط.");
    }
  });

  if (loginNavBtn) {
    loginNavBtn.addEventListener("click", (e) => {
      if (isAdminLoggedIn) {
        e.preventDefault();
        if (confirm("هل تريد تسجيل الخروج؟")) {
          isAdminLoggedIn = false;
          localStorage.setItem("bo3dil_is_admin", "false");
          updateAdminUI();
          alert("تم تسجيل الخروج بنجاح.");
          window.location.reload();
        }
      }
    });
  }

  const avatarUpload = document.getElementById("avatar-upload");
  const userAvatar = document.getElementById("user-avatar");

  const savedAvatar = localStorage.getItem("bo3dil_avatar");
  if (savedAvatar && userAvatar) userAvatar.src = savedAvatar;

  avatarUpload?.addEventListener("change", (e) => {
    if (!isAdminLoggedIn) {
      alert("عذراً، لا تملك الصلاحية لتغيير صورة البروفايل!");
      return;
    }

    const file = e.target.files[0];
    if (file && userAvatar) {
      const reader = new FileReader();
      reader.onload = (event) => {
        userAvatar.src = event.target.result;
        localStorage.setItem("bo3dil_avatar", event.target.result);
        alert("تم تحديث الصورة الشخصية بنجاح!");
      };
      reader.readAsDataURL(file);
    }
  });

  renderProjects();
});
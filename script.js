document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => loader.style.display = "none", 500);
    }, 1000);
  }

  let projects = JSON.parse(localStorage.getItem("bo3dil_projects")) || [];

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
      projectsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #94a3b8;">لا يوجد مشاريع حالياً. أضف مشروعك الأول من النموذج أعلاه!</p>`;
      return;
    }

    projects.forEach((proj, index) => {
      const card = document.createElement("div");
      card.className = "glass-card project-card";
      card.innerHTML = `
        <img src="${proj.image}" class="project-img" alt="${proj.title}">
        <h3>${proj.title}</h3>
        <p>${proj.desc}</p>
        
        <div class="project-actions">
          <button class="action-btn" onclick="likeProject(${index})"><i class="fa-solid fa-thumbs-up"></i> ${proj.likes || 0}</button>
          <button class="action-btn" onclick="dislikeProject(${index})"><i class="fa-solid fa-thumbs-down"></i> ${proj.dislikes || 0}</button>
          <button class="action-btn" onclick="viewCode(${index})"><i class="fa-solid fa-code"></i> الكود</button>
          <button class="action-btn" onclick="shareProject('${proj.title}')"><i class="fa-solid fa-share-nodes"></i> نشر</button>
          <button class="action-btn delete-btn" onclick="deleteProject(${index})"><i class="fa-solid fa-trash"></i> حذف</button>
        </div>

        <div class="comments-container">
          <div class="comments-list">
            ${(proj.comments || []).map(c => `<div class="comment-item">${c}</div>`).join("")}
          </div>
          <div style="display:flex; gap:5px;">
            <input type="text" id="comment-input-${index}" placeholder="اكتب تعليقاً..." style="flex:1; padding:5px;">
            <button class="action-btn" onclick="addComment(${index})">تعليق</button>
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  projectForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    if (projects.length >= 10) {
      alert("عذراً، الحد الأقصى للمشاريع المسموح باستضافتها هو 10 مشاريع فقط.");
      return;
    }

    const title = document.getElementById("project-title").value;
    const desc = document.getElementById("project-desc").value;
    const code = document.getElementById("project-code").value;
    const imgFile = document.getElementById("project-image").files[0];

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
    };
    if (imgFile) reader.readAsDataURL(imgFile);
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
    if (confirm("هل أنت تأكد من رغبتك في حذف هذا التصميم؟")) {
      projects.splice(index, 1);
      saveAndRender();
    }
  };

  window.addComment = (index) => {
    const input = document.getElementById(`comment-input-${index}`);
    if (input.value.trim() !== "") {
      if (!projects[index].comments) projects[index].comments = [];
      projects[index].comments.push(input.value.trim());
      saveAndRender();
    }
  };

  window.shareProject = (title) => {
    navigator.clipboard.writeText(window.location.href);
    alert(`تم نسخ رابط الموقع لمشاركة مشروع "${title}"!`);
  };

  const codeModal = document.getElementById("code-modal");
  const modalCodeEditor = document.getElementById("modal-code-editor");
  const saveCodeBtn = document.getElementById("save-code-btn");
  let currentEditIndex = null;

  if (codeModal && modalCodeEditor && saveCodeBtn) {
    window.viewCode = (index) => {
      currentEditIndex = index;
      modalCodeEditor.value = projects[index].code;
      codeModal.style.display = "flex";
    };

    saveCodeBtn.addEventListener("click", () => {
      if (currentEditIndex !== null) {
        projects[currentEditIndex].code = modalCodeEditor.value;
        saveAndRender();
        codeModal.style.display = "none";
      }
    });

    document.querySelector(".close-code-modal").onclick = () => codeModal.style.display = "none";
  }

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
  
  const usernameInput = loginForm.querySelector("input[type='text']").value;
  const passwordInput = loginForm.querySelector("input[type='password']").value;

  if (usernameInput === "Bo3Dil" && passwordInput === "123456") {
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
    };
    reader.readAsDataURL(file);
  }
});

renderProjects();
});